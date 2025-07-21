import { Vote } from "./room.models";

// createRoom

export interface CreateRoomRequest {
  name: string;
}

// joinRoom

export interface JoinRoomRequest {
  roomId: string;
  name: string;
}

// quitRoom

export interface QuitRoomRequest {
  roomId: string;
  participantId: string;
}

// removeRoom

export interface RemoveRoomRequest {
  roomId: string;
  creatorId: string;
}

// revealVotes

export interface RevealVotesRequest {
  roomId: string;
  creatorId: string;
}

// createTask

export interface CreateTaskRequest {
  title: string;
  description: string;
  creatorId: string;
  roomId: string;
}

// submitVote

export interface SubmitVoteRequest {
  roomId: string;
  participantId: string;
  vote: Vote;
}