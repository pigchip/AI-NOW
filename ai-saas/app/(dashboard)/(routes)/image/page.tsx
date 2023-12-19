"use client";

import axios from "axios";
import * as z from "zod";
import { useState } from "react";
import { Download, ImageIcon} from "lucide-react";
import { useForm } from "react-hook-form";
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
import {st} from "@/app/firebase";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import NextCors from 'nextjs-cors';
import type { ImageLoaderProps } from 'next/image';




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


  //var remoteimageurl = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-RgafuQDCiin7UF7yklAcT44G/user-sK3DHq5ObBQIH3dzToscMyZz/img-4TK95UoGiiVq69qRfkpTiuEt.png?st=2023-12-18T05%3A39%3A58Z&se=2023-12-18T07%3A39%3A58Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-12-17T19%3A40%3A48Z&ske=2023-12-18T19%3A40%3A48Z&sks=b&skv=2021-08-06&sig=nKmNVDklmy105Hk8m4%2BudRG6kAxvDNiaJOKin7xZuIU%3D"
  //var remoteimageurl = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-RgafuQDCiin7UF7yklAcT44G/user-sK3DHq5ObBQIH3dzToscMyZz/img-Hp86pCG161pokxDEug1vTRr2.png?st=2023-12-18T07%3A48%3A27Z&se=2023-12-18T09%3A48%3A27Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-12-17T18%3A36%3A15Z&ske=2023-12-18T18%3A36%3A15Z&sks=b&skv=2021-08-06&sig=viF2yipEboVMX6x3SHBpF4k7bb7Fq101mvp2TJwERmc%3D"
  //var remoteimageurl = "http://localhost:3000/_next/image?url=https%3A%2F%2Foaidalleapiprodscus.blob.core.windows.net%2Fprivate%2Forg-RgafuQDCiin7UF7yklAcT44G%2Fuser-sK3DHq5ObBQIH3dzToscMyZz%2Fimg-V62fi6o5v4j5tQwxpC5DWfVU.png%3Fst%3D2023-12-18T07%253A57%253A28Z%26se%3D2023-12-18T09%253A57%253A28Z%26sp%3Dr%26sv%3D2021-08-06%26sr%3Db%26rscd%3Dinline%26rsct%3Dimage%2Fpng%26skoid%3D6aaadede-4fb3-4698-a8f6-684d7786b067%26sktid%3Da48cca56-e6da-484e-a814-9c849652bcb3%26skt%3D2023-12-17T15%253A44%253A58Z%26ske%3D2023-12-18T15%253A44%253A58Z%26sks%3Db%26skv%3D2021-08-06%26sig%3Dy%252BwPO5IQX3BuZ42bjp87cZwJANLy3AIaA5mI87DE1Q0%253D&w=1080&q=75";
  //var remoteimageurl = "https://user-images.githubusercontent.com/8822573/41818831-84e0d4a8-77b6-11e8-8080-22f8cb2b1530.png";
  var filename = "images/photo";
  let contador = 1;
 
 const f = (remoteimageurl: string) => fetch(remoteimageurl).then(res => {
  contador++;
  return res.blob();
}).then(blob => {
    //uploading blob to firebase storage
    console.log(blob);
    const storageRef = ref(st,filename.concat(contador.toString()).concat(".png"));
    const s = uploadBytes(storageRef,blob);
    console.log(blob);
}).catch(error => {
  console.error(error);
});
/*
const g = async() =>{
  return await axios.request({url: remoteimageurl ,method: 'GET',responseType:'blob'}).then (response =>{
    const storageRef = ref(st,filename);
    console.log(response.data);
    //uploadBytes(storageRef,response.data); 
  }).catch(error => {
    console.log('error: ', error);
  }).finally( () =>{
    console.log("Yata");
  }
  )
}
*/

  const [values,setValues] = useState(initialStateValues);

  const isLoading = form.formState.isSubmitting;

  const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    return `https://localhost:3000/${src}?w=${width}&q=${quality || 75}`
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    
    try{
      setImages([]);
      const response = await axios.post('/api/image', values);
      //console.log(response);
      const urls= response.data.map((image:{url:string})=>image.url);
      //console.log(urls)
      setImages(urls);
      //console.log(setImages)
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
               // onSubmit={handleSubmit1}
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
                   
                    <Image
      loader={imageLoader}
      src={src}
      alt="Picture of the author"
      width={500}
      height={500}
    />
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
