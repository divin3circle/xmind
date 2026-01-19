import { useEffect, useState } from "react";
import { ITemplate } from "@/lib/models/Template";
import axios, { AxiosError as Axios } from "axios";

export function useTemplates(initialTemplates: ITemplate[] = []) {
  const [templates, setTemplates] = useState<ITemplate[]>(initialTemplates);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/templates");
      if (response.status !== 200) {
        throw new Error("Failed to fetch templates");
      }
      const data = response.data;
      setTemplates(data.templates);
    } catch (err: unknown) {
      const axiosError = err as Axios;
      setError(axiosError.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
  };
}
