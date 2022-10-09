import { RoomDetailParams, RoomListParams } from '~~/common/types/fetchType'
import { getFetch } from '~~/common/utils/fetchUtil'

export function useFetchRoomList(params: RoomListParams) {
  return getFetch('/room/room/getRoomList', params)
}

export function useFetchRoomDetail(params: RoomDetailParams) {
  return getFetch('/room/room/getRoomDetail', params)
}
