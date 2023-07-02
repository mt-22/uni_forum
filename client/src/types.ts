export interface User {
    id: string
    email: string
    username: string
  }

  export interface PostObject {
    id: string
    user: string
    body: string
    title: string
    time: string
    likes: Array<any>
    liked:boolean
    subforum: string
    media_link: string | undefined
    comments: Array<any>
  }

  export const BlankPost:PostObject = {
    likes: Array(),
    liked: Boolean(),
    id: String(),
    user: String(),
    title: String(),
    body: String(),
    time: String(),
    subforum: String(),
    media_link: undefined,
    comments: Array()
}
