import { Integration } from '../../entity/integration'
import { ArticleSavingRequestStatus, Page } from '../../elastic/types'

export interface RetrievedData {
  url: string
  labels?: string[]
  state?: ArticleSavingRequestStatus
}
export interface RetrievedResult {
  data: RetrievedData[]
  hasMore?: boolean
  since?: number // unix timestamp in milliseconds
}

export interface RetrieveRequest {
  token: string
  since?: number // unix timestamp in milliseconds
  count?: number
  offset?: number
}

export abstract class IntegrationService {
  abstract name: string

  accessToken = async (token: string): Promise<string | null> => {
    return Promise.resolve(null)
  }
  export = async (
    integration: Integration,
    pages: Page[]
  ): Promise<boolean> => {
    return Promise.resolve(false)
  }
  retrieve = async (req: RetrieveRequest): Promise<RetrievedResult> => {
    return Promise.resolve({ data: [] })
  }
}
