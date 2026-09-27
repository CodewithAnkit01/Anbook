import { Globe, Users, Lock } from "lucide-react";

export const VISIBILITY = {
  PUBLIC: { icon: Globe, label: "Public" },
  FOLLOWERS: { icon: Users, label: "Followers only" },
  PRIVATE: { icon: Lock, label: "Only me" },
};

export const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public", icon: Globe },
  { value: "FOLLOWERS", label: "Followers", icon: Users },
  { value: "PRIVATE", label: "Only me", icon: Lock },
];