
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";
import { ThemeMode } from "@/types";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { 
      value: "light", 
      label: "Light", 
      icon: <Sun className="h-4 w-4 mr-2" /> 
    },
    { 
      value: "dark", 
      label: "Dark", 
      icon: <Moon className="h-4 w-4 mr-2" /> 
    },
    { 
      value: "system", 
      label: "System", 
      icon: <Laptop className="h-4 w-4 mr-2" /> 
    }
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="flex items-center cursor-pointer"
          >
            {option.icon}
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
