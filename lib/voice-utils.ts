import { uploadVoice, mixVoice, getRecording, getAudioFile } from "./server-actions";
export class VoiceUtils {
  static async uploadVoice(id: string) {
    await uploadVoice(id);
  }
  static async mixVoice(id: string, alpha: number = 2) {
    await mixVoice(id, alpha);
  }
  static async getRecording(experimentId: string, input: string) {
    await getRecording(experimentId, input);
  }
  static async getAudioFile(experimentId: string) {
    return await getAudioFile(experimentId);
  }
}
