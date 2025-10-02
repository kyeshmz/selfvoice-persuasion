import { 
  updateAudioFile,
  updateConsent,
  updateDemographics,
  getParticipant,
  updateEligibility,
  getOrCreateExperiment
} from './server-actions';

export class DataUtils {
  static async updateAudioFile(id: string, audioBlob: Blob) {
    return await updateAudioFile(id, audioBlob);
  }

  static async updateConsent(id: string, consent: boolean) {
    return await updateConsent(id, consent);
  }

  static async updateDemographics(id: string, answers: Record<string, string>) {
    return await updateDemographics(id, answers);
  }

  static async getParticipant(id: string) {
    return await getParticipant(id);
  }

  static async updateEligibility(id: string, eligible: boolean, reason?: string) {
    return await updateEligibility(id, eligible, reason);
  }

  static async getOrCreateExperiment(id: string) {
    return await getOrCreateExperiment(id);
  }
}
