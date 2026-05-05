import { useCallback, useState } from "react";
import { getApiBaseUrl } from "./utils";
import { getAuthHeader } from "@/lib/auth";

export type SkillInfo = {
  name: string;
  description: string;
  scope: string;
  type: string;
};

export function useSkills() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const basePath = getApiBaseUrl();
      const response = await fetch(`${basePath}/api/sessions/skills`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error("Failed to load skills");
      }
      const data = (await response.json()) as SkillInfo[];
      setSkills(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load skills";
      setError(message);
      console.error("Failed to refresh skills:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { skills, refreshSkills, isLoading, error };
}
