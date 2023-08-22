import { PromptTemplate } from "langchain/prompts";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";

export default class Summarizer {
  private chain;
  constructor(private model: OpenAI) {
    this.chain = this.createChain();
  }

  private createChain() {
    const map_prompt = `
    Write a concise summary of the following:
    {text}
    CONCISE SUMMARY:
    `;

    const combine_prompt = `
    Write a concise summary of the following text delimited by triple doublequotes.
    Return your response in bullet points which covers the key points of the text.
    """{text}"""
    BULLET POINT SUMMARY:
    `;
    const map_prompt_template = PromptTemplate.fromTemplate(map_prompt);
    const combined_prompt_template =
      PromptTemplate.fromTemplate(combine_prompt);

    return loadSummarizationChain(this.model, {
      type: "map_reduce",
      combineMapPrompt: map_prompt_template,
      combinePrompt: combined_prompt_template,
    });
  }

  async summarize(docs: Document<Record<string, any>>[]) {
    const response = await this.chain.call({
      input_documents: docs,
    });
    return response;
  }
}
