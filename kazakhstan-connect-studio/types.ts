
export interface EventDetails {
  title: string;
  tagline: string;
  date: string;
  location: string;
  description: string;
  theme: string;
}

export interface GeneratedPoster {
  imageUrl: string;
  details: EventDetails;
}

export enum LoadingState {
  IDLE = 'IDLE',
  REFINING_TEXT = 'REFINING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
