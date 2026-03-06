import { S } from "@/constants/styles";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return <div style={S.toast}>{message}</div>;
}
