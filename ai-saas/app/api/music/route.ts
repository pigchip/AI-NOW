import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});


export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt } = body;

        if (!userId) {
            //Valida que el usuario haya iniciado sesion
            return new NextResponse("Unauthorized", { status: 401});
        }

        if (!prompt) {
            //Valida que la apiKey haya sido configurada de manera correcta
            return new NextResponse("Prompt is required", { status: 400 });
        }

        const freeTrial = await checkApiLimit();

        if(!freeTrial){
            return new NextResponse("Free trial has expired", { status: 403 });
        }

        const response = await replicate.run(
            "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
            {
                input: {
                prompt_a: prompt
                }
            }
            );

        await increaseApiLimit();

        return NextResponse.json(response);
    } catch (error) {
        console.log("[MUSIC_GENERATOR_ERROR]", error);
        return new NextResponse("Internal error", { status: 500});
    }
}