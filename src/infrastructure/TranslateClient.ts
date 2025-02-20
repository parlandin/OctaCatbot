import { injectable } from "tsyringe";

export interface TranslateResponse {
  data: {
    translations: {
      translatedText: string;
    }[];
  };
}

@injectable()
export class TranslateClient {
  private apiKey = process.env.GOOGLE_TRANSLATE_API_KEY as string;
  private baseUrl = process.env.GOOGLE_TRANSLATE_API_URL as string;
  private url = `${this.baseUrl}?key=${this.apiKey}`;
  private headers = {
    "Content-Type": "application/json",
  };

  public async translate(
    text: string,
    target: string,
    source = "en",
  ): Promise<string> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        q: text,
        target,
        source,
      }),
    });

    const data = (await response.json()) as TranslateResponse;

    console.log(data);

    if (!data.data.translations.length)
      return "Não foi possível traduzir a mensagem";

    return data.data?.translations[0]?.translatedText ?? "";
  }
}
