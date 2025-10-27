
export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  sources?: Source[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}