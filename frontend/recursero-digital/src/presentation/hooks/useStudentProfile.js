import { useState, useEffect } from "react";
import { getStudentProfile } from "../services/studentService";
import { useUser } from "./useUser";


export const useStudentProfile = () => {
  const userName = useUser();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userName) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        

        const profileData = await getStudentProfile(userName);
        setData(profileData);
        
      } catch (err) {
        setError('Error al cargar el perfil del estudiante');
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userName]);

  const refreshProfile = async () => {
    if (userName) {
      try {
        setLoading(true);
        setError(null);
        const profileData = await getStudentProfile(userName);
        setData(profileData);
      } catch (err) {
        setError('Error al recargar el perfil del estudiante');
        console.error('Error refreshing student profile:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    data,
    loading,
    error,
    refreshProfile
  };
};