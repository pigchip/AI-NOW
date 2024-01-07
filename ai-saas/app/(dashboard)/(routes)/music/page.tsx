"use client";

import axios from "axios";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Music} from "lucide-react";
import { useForm } from "react-hook-form";
import { Heading } from "@/components/heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formSchema } from "./constants";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import {st} from "@/app/firebase";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import {fb} from "@/app/firebase";
import {getFirestore} from "firebase/firestore";
import { addDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore"; 

const MusicPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [music,setMusic] = useState<string[]>([]);
  const form= useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        prompt:""
    }
    
  });
  const isLoading = form.formState.isSubmitting;
  //var test;


  const getLinks = async() =>{
    const idValues ={
      prompt: "idUser",
      amount: "idUser",
      resolution: "idUser"
    }
    const response = await axios.post('/api/image',idValues);
    const userID = response.data;
    const db = getFirestore(fb);
     const q = query(collection(db,"music"),where("userID","==",userID));
     let finalURLS: any[]=[];
     const unsusbcribe = onSnapshot(q,(querySnapshot)=>{
      querySnapshot.forEach((doc) => {
        const aux = doc.data();
        finalURLS.push(aux)
       });
     })
    setMusic(finalURLS);
    router.refresh();
     console.log(finalURLS);
  }



  var filename = "music/audio";
  const base = '//cors-anywhere.herokuapp.com/';

  const f =async (url: string,userId: string, prompt: string) => fetch(base.concat(url)).then(res => {
    return res.blob();
  }).then(async blob => {
    const contador = url.substring(33,81);
      //console.log(blob);
      const storageRef = ref(st,filename.concat(contador.concat(".wav")));
      const imgName = filename.concat(contador.concat(".wav"));
      await uploadBytes(storageRef,blob);
      const storage = getStorage();
      const downloadURL = await getDownloadURL(ref(storage,filename.concat(contador.concat(".wav"))));
      //console.log(downloadURL,userId);
      await addAudio(userId,downloadURL,prompt);
  }).catch(error => {
    console.error(error);
  });

  const addAudio = async(userID: any, audioLink: string,prompt:string) =>{
    const db = getFirestore(fb);
    await addDoc(collection(db,"music"),{
      userID: userID,
      audioLink: audioLink,
      prompt: prompt
    }).then(() =>{
      console.log("done");
    }).catch((error)=>{
      console.log(error);
    });
    
}

useEffect(()=>{
  getLinks();
},[])


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try{
      //setMusic([]); 
      const idValues ={
        prompt: "idUser",
        amount: "idUser",
        resolution: "idUser"
      }
      const response = await axios.post('/api/music',values);
      console.log(values.prompt);
      const response1 = await axios.post('/api/image',idValues);
      const userId = await response1.data;
      //console.log(userId);
      await f(response.data.audio,userId,values.prompt);


      const db = getFirestore(fb);
      const q = query(collection(db,"music"),where("userID","==",userId));
      const querySnapshot = await getDocs(q);
      let finalURLS: any[]=[];
      querySnapshot.forEach((doc) => {
       const aux = doc.data();
       finalURLS.push(aux)
     });
     console.log(finalURLS);
      setMusic(finalURLS);
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
        title="Music generation"
        description="Turn your prompt into music"
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
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
                                  placeholder="Piano solo"
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
        <div className="space-y-4 mt-4" >
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-[#000000]">
              <Loader/>
            </div>
          )}
          {!music && !isLoading && (
            <Empty label="No music generated"/>
          )}
          {music.map((src:any) => (
             
            <div className="p-5 rounded-lg w-full  items-center justify-center bg-zinc-800" key={src.audioLink}>
                  <div className="rounded-lg items-center justify-center text-white"><center>
                    {src.prompt}
                    </center></div>
              <audio controls className="w-full mt-8">
                <source src={src.audioLink}/>
              </audio>
              
            </div>
            
          ))}
        </div>
      </div>
    </div>
  );
};
export default MusicPage;
