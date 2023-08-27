import { PromptTemplate } from "langchain/prompts";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";

export default class Summarizer {
  constructor(private model: OpenAI) {
  }

  private createChain(returnImmediateStep = false) {
    const combine_prompt = `
    Write a concise summary of the following text delimited by triple doublequotes.
    Return your response in bullet points which covers the key points of the text.
    """{text}"""
    BULLET POINT SUMMARY:
    `;
    const combined_prompt_template =
      PromptTemplate.fromTemplate(combine_prompt);

    return loadSummarizationChain(this.model, {
      type: "map_reduce",
      combineMapPrompt: combined_prompt_template,
      combinePrompt: combined_prompt_template,
      returnIntermediateSteps: returnImmediateStep,
    });
  }

  async summarize(docs: Document<Record<string, any>>[], returnImmediateStep = false) {
    const chain = this.createChain(returnImmediateStep)
    const response = await chain.call({
      input_documents: docs,
    });
    return response;
  }
}
