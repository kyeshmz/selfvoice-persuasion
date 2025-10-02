import { uploadVoice, mixVoice, getRecording } from "./server-actions";
export class VoiceUtils {
  static async uploadVoice(id: string) {
    await uploadVoice(id);
  }
  static async mixVoice(id: string, experimentId: string, alpha: number = 9) {
    await mixVoice(id, experimentId, alpha);
  }
  static async getRecording(experimentId: string, input: string) {
    await getRecording(experimentId, input);
  }

}
