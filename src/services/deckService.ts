import axiosClient from '../api/axiosClient'
import type { ApiResponse, PageResponse } from '../types/api'
import type {
  DeckCardAddRequest,
  DeckCardResponse,
  DeckCreateRequest,
  DeckResponse,
  DeckSummaryResponse,
  DeckUpdateRequest,
} from '../types/deck'

export interface GetDecksParams {
  keyword?: string
  page?: number
  size?: number
}

async function getPublicDecks(params: GetDecksParams = {}): Promise<PageResponse<DeckSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<DeckSummaryResponse>>>('/api/decks', { params })
  return response.data.data
}

async function getMyDecks(params: { page?: number; size?: number } = {}): Promise<PageResponse<DeckSummaryResponse>> {
  const response = await axiosClient.get<ApiResponse<PageResponse<DeckSummaryResponse>>>('/api/decks/mine', { params })
  return response.data.data
}

async function getDeckById(id: number): Promise<DeckResponse> {
  const response = await axiosClient.get<ApiResponse<DeckResponse>>(`/api/decks/${id}`)
  return response.data.data
}

async function getDeckCards(id: number): Promise<DeckCardResponse[]> {
  const response = await axiosClient.get<ApiResponse<DeckCardResponse[]>>(`/api/decks/${id}/cards`)
  return response.data.data
}

async function createDeck(request: DeckCreateRequest): Promise<DeckResponse> {
  const response = await axiosClient.post<ApiResponse<DeckResponse>>('/api/decks', request)
  return response.data.data
}

async function updateDeck(id: number, request: DeckUpdateRequest): Promise<DeckResponse> {
  const response = await axiosClient.put<ApiResponse<DeckResponse>>(`/api/decks/${id}`, request)
  return response.data.data
}

async function deleteDeck(id: number): Promise<void> {
  await axiosClient.delete(`/api/decks/${id}`)
}

async function addCard(id: number, request: DeckCardAddRequest): Promise<DeckCardResponse> {
  const response = await axiosClient.post<ApiResponse<DeckCardResponse>>(`/api/decks/${id}/cards`, request)
  return response.data.data
}

async function deleteCard(id: number, cardId: number): Promise<void> {
  await axiosClient.delete(`/api/decks/${id}/cards/${cardId}`)
}

async function cloneDeck(id: number): Promise<DeckResponse> {
  const response = await axiosClient.post<ApiResponse<DeckResponse>>(`/api/decks/${id}/clone`)
  return response.data.data
}

export default {
  getPublicDecks,
  getMyDecks,
  getDeckById,
  getDeckCards,
  createDeck,
  updateDeck,
  deleteDeck,
  addCard,
  deleteCard,
  cloneDeck,
}
