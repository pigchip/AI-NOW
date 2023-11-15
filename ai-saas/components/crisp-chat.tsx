"use client"
import { useEffect } from "react";
import {Crisp} from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("cce30188-c53a-4410-a1ee-c6d1a9e31ab7");
    }, []);

    return null;
};