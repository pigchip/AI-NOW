import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt, amount=1, resolution="512x512" } = body;

        if (!userId) {
            //Valida que el usuario haya iniciado sesion
            return new NextResponse("Unauthorized", { status: 401});
        }

        if (!configuration.apiKey) {
            //Valida que la apiKey haya sido configurada de manera correcta
            return new NextResponse("OpenAI API Key not configured", { status: 400 });
        }

        if (!prompt) {
            //Valida que el usuario haya enviado el promp
            return new NextResponse("Promp is required", { status: 400 });
        }

        if (!amount) {
            //Valida que el usuario haya enviado el promp
            return new NextResponse("Amount is required", { status: 400 });
        }
        if (!resolution) {
            //Valida que el usuario haya enviado el promp
            return new NextResponse("Resolution is required", { status: 400 });
        }

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();

        if(!freeTrial && !isPro){
            return new NextResponse("Free trial has expired", { status: 403 });
        }

        const response = await openai.createImage({
            prompt,
            n: parseInt(amount,10),
            size: resolution,
        });
        
       if(!isPro){
        await increaseApiLimit();
       }
        console.log(prompt, amount, resolution);
        return NextResponse.json(response.data.data);
    } catch (error) {
        console.log("[IMAGE_ERROR]", error);
        return new NextResponse("Internal error", { status: 500});
    }
}