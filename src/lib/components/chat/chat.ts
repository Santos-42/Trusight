export type ChatMsg = {
  me: boolean;
  text: string;
  time?: string;
  file?: { name: string; meta: string };
};
