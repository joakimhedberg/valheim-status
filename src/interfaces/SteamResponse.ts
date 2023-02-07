import SteamPlayer from './SteamPlayer'

export default interface SteamResponse {
  response?: {
    players?: SteamPlayer[]
  }
}
