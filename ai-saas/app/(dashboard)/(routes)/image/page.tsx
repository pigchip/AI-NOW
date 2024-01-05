"use client";
import axios from "axios";
import * as z from "zod";
import { useState } from "react";
import { Download, ImageIcon} from "lucide-react";
import { useForm } from "react-hook-form";
import React,{useEffect} from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { amountOptions, formSchema, resolutionOptions } from "./constants";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";
import {fb,st} from "@/app/firebase";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import {getFirestore} from "firebase/firestore";
import { addDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore"; 



const ImagePage = () => {
  const proModal= useProModal();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const form= useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        prompt:"",
        amount:"1",
        resolution:"512x512"
    }
  });

  const initialStateValues = {
    url: '',
    id: ''
  }

  const getLinks = async() =>{
    const idValues ={
      prompt: "idUser",
      amount: "idUser",
      resolution: "idUser"
    }
    const response = await axios.post('/api/image',idValues);
    const userID = response.data;
    const db = getFirestore(fb);
     const q = query(collection(db,"images"),where("userID","==",userID));
     let finalURLS: string[]=[];
     const unsusbcribe = onSnapshot(q,(querySnapshot)=>{
      querySnapshot.forEach((doc) => {
        const aux = doc.data();
        finalURLS.push(aux.imgLink)
       });
     })
     
    // const querySnapshot = await getDocs(q);
     //let finalURLS: string[]=[];
     //querySnapshot.forEach((doc) => {
     // const aux = doc.data();
     // finalURLS.push(aux.imgLink)
    //});
    setImages(finalURLS);
    router.refresh();
     console.log(finalURLS);
  }


  useEffect(()=>{
      getLinks();
  },[])





  var filename = "images/photo";
  
//Activar servidor de CORS para que funcione
const base = '//cors-anywhere.herokuapp.com/';
const f =async (url: string,userId: string) => fetch(base.concat(url)).then(res => {
  return res.blob();
}).then(async blob => {
  const contador = url.substring(121,145);
    //console.log(blob);
    const storageRef = ref(st,filename.concat(contador.concat(".png")));
    const imgName = filename.concat(contador.concat(".png"));
    await uploadBytes(storageRef,blob);
    const storage = getStorage();
    const downloadURL = await getDownloadURL(ref(storage,filename.concat(contador.concat(".png"))));
    //console.log(downloadURL);
    
    await addImg(userId,downloadURL);
}).catch(error => {
  console.error(error);
});


  const addImg = async(userID: any, imgLink: string) =>{
      const db = getFirestore(fb);
      await addDoc(collection(db,"images"),{
        userID: userID,
        imgLink: imgLink
      }).then(() =>{
        console.log("done");
      }).catch((error)=>{
        console.log(error);
      });
      
  }


  const [values,setValues] = useState(initialStateValues);

  const isLoading = form.formState.isSubmitting;


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try{
      //setImages([]);
      const response = await axios.post('/api/image', values);
      //console.log(response);
      const userId = await response.data['userId'];
      delete response.data['userId'];
      const enlaces = Object.values(response.data);
      //console.log(enlaces)
      try{
        const urls = enlaces.map((p:any) => p.url)
      //console.log(urls);
     //console.log(urls.length);
     for(let i=0;i<urls.length;i++){
          await f(urls[i],userId);
     }
     

     const db = getFirestore(fb);
     const q = query(collection(db,"images"),where("userID","==",userId));
     const querySnapshot = await getDocs(q);
     let finalURLS: string[]=[];
     querySnapshot.forEach((doc) => {
      const aux = doc.data();
      finalURLS.push(aux.imgLink)
    });
     console.log(finalURLS);
     setImages(finalURLS);
      }catch(error:any){
        console.log(error)
      }
      
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
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
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
                            <FormItem className="col-span-12 lg:col-span-6">
                                <FormControl className="m-0 p-0">
                                  <Input 
                                  className="border-0 outline-none 
                                  focus-visible:ring-0
                                  focus-visible:ring-transparent"
                                  disabled={isLoading}
                                  placeholder="A picture of a horse in the forest"
                                  {...field}
                                  />  
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField 
                    control={form.control}
                    name="amount"
                    render={({ field})=>(
                      <FormItem className="col-span-12 lg:col-span-2">
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger >
                                <SelectValue defaultValue={field.value}/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {amountOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    />
    
                   <FormField 
                    control={form.control}
                    name="resolution"
                    render={({ field})=>(
                      <FormItem className="col-span-12 lg:col-span-2">
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger >
                                <SelectValue defaultValue={field.value}/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resolutionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
            <div className="p-20">
              <Loader/>
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <Empty label="No images generated."/>
          )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {images.map((src) => (
                <Card key={src} className="rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                  <Image alt="Image" fill src={src} />
                  </div>
                  <CardFooter className="p-2">
                    <Button onClick={()=>window.open(src)} variant="secondary" className="w-full">
                      <Download className="h-4 w-4 mr-2"/>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default ImagePage;
