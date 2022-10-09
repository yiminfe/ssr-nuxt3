import { Ref } from 'nuxt/dist/app/compat/vue-demi'

export interface IResultOr {
  // 定义interface规范返回结果的类型
  code: string
  success: boolean
  message: string
  result: any
}

export interface SearchParams {
  [key: string]: any
}

export interface BaseParams {
  params?: SearchParams
  query?: SearchParams
  body?: Record<string, any>
}

export interface RoomListParams extends SearchParams {
  pageNo: number
  pageSize: number
  cityCode: string
}

export interface RoomDetailParams extends SearchParams {
  id: number
}

export type AsyncData<DataT> = {
  data: Ref<DataT>
  pending: Ref<boolean>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  error: Ref<Error | boolean>
}
