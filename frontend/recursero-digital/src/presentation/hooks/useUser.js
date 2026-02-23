import { useMemo } from "react";


export const useUser = () => {
  return useMemo(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    
    if (storedName) return storedName.toUpperCase();
    if (storedEmail) {
      const nameFromEmail = storedEmail.split("@")[0];
      return nameFromEmail.toUpperCase();
    }
    return "ALUMNO";
  }, []);
};