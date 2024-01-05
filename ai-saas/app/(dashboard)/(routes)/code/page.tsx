"use client";

import axios from "axios";
import * as z from "zod";
import { useState,useEffect } from "react";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import { Heading } from "@/components/heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formSchema } from "./constants";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import ReactMarkdown from "react-markdown";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import {fb} from "@/app/firebase";
import {getFirestore} from "firebase/firestore";
import { addDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore"; 

const CodePage = () => {
  const proModal= useProModal();
  const router = useRouter();
  const [messages,setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  
  const form= useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        prompt:""
    }
  });


  useEffect(()=>{
    getCode();
},[])

  const getCode = async() =>{
    const idValues ={
      prompt: "idUser",
      amount: "idUser",
      resolution: "idUser"
    }
    const response = await axios.post('/api/image',idValues);
    const userID = response.data;
    const db = getFirestore(fb);
     const q = query(collection(db,"code"),where("userID","==",userID));
     let finalConvs: any[]=[];
     const unsusbcribe = onSnapshot(q,(querySnapshot)=>{
      querySnapshot.forEach((doc) => {
        const aux = doc.data();
        finalConvs.push(aux.question);
        finalConvs.push(aux.answer)
       });
     })
    setMessages(finalConvs);
    router.refresh();
     //console.log(finalURLS);
  }


  const addCode = async(userID: any, question: any, answer:any) =>{
    const db = getFirestore(fb);
    await addDoc(collection(db,"code"),{
      userID: userID,
      question: question,
      answer: answer
    }).then(() =>{
      console.log("done");
    }).catch((error)=>{
      console.log(error);
    });
    
}


  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try{

      const userMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      console.log(newMessages);
      const response = await axios.post('/api/code',{
        messages: newMessages,
      });

      const idValues ={
        prompt: "idUser",
        amount: "idUser",
        resolution: "idUser"
      }

      const response1 = await axios.post('/api/image',idValues);
      const userID = response1.data;
      await addCode(userID,userMessage,response.data);
      const db = getFirestore(fb);
       const q = query(collection(db,"code"),where("userID","==",userID));
       let finalConvs: any[]=[];
       const querySnapshot = await getDocs(q);
       querySnapshot.forEach((doc) => {
        const aux = doc.data();
        finalConvs.push(aux.question);
        finalConvs.push(aux.answer);
      });

      setMessages(finalConvs);

      form.reset();
    } catch (error: any) {
      if(error?.response?.status ===403){
        proModal.onOpen();
    } else {
      toast.error("Something went wrong");
    }
    } finally {
      router.refresh();
    }
  };

    return (
    <div>
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
            <Form {...form}>
                <form 
                onSubmit={form.handleSubmit(onSubmit)}
                className="
                rounded-lg 
                border
                w-full
                p-4
                px-3
                md:px-6
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2"
                >
                    <FormField 
                        name="prompt"
                        render={({ field})=>(
                            <FormItem className="col-span-12 lg:col-span-10">
                                <FormControl className="m-0 p-0">
                                  <Input 
                                  className="border-0 outline-none 
                                  focus-visible:ring-0
                                  focus-visible:ring-transparent"
                                  disabled={isLoading}
                                  placeholder="Simple toggle button using react hooks."
                                  {...field}
                                  />  
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                        Generate
                    </Button>
                </form>
            </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-[#000000]">
              <Loader/>
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="No conversation started"/>
          )}
            <div className="flex flex-col-reverse gap-y-4">
                {messages.map((message) => (
                  <div 
                  key={message.content}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message.role == "user" ? "bg-zinc-600 border border-black/5": "bg-zinc-800"
                  )}
                  >
                    {message.role === "user" ? <UserAvatar/> : <BotAvatar/>}

                    <ReactMarkdown
                    components={{
                      pre: ({node, ...props}) =>(
                        <div className="overflow-auto w-full my-2 bg-black/30 p-2 rounded-lg text-white">
                            <pre {...props}/>
                        </div>
                      ),
                      code: ({node, ...props}) => (
                        <code className="bg-black rounded-lg p-1 text-white" {...props} />
                      )
                    }}
                    className="text-sm overflow-hidden leading-7 text-white"
                    >
                      {message.content || ""}
                    </ReactMarkdown>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default CodePage;
