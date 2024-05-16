import { useRouter } from 'next/router'
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()
  useEffect(_ => {
    window.history.replaceState(null, null, "/login");
    window.location = "login";
  }, []);
  return (
    <></>
  );
}