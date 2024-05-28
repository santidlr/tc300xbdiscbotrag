import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAI, OpenAIEmbeddings} from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RetrievalQAChain } from "langchain/chains";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

  

(async () => {

  const directoryLoader = new DirectoryLoader(
    "./PDF/",
    {
      ".pdf": (path) => new PDFLoader(path),
    }
  );


  const docs = await directoryLoader.load();
  console.log({ docs });

  // Chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const splitDocs = await textSplitter.splitDocuments(docs);
  console.log({ splitDocs });


  const model = new OpenAI({
    model: "gpt-3.5-turbo", 
    temperature: 0.9,
    apiKey: process.env.OPENAI_API_KEY, 
  });

  // Vector store local en memoria
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, new OpenAIEmbeddings());

  // Retriever
  const vectorStoreRetriever = vectorStore.asRetriever();

  // Chain that uses the OpenAI LLM and HNSWLib vector store
  const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);

  // Example query
  const res = await chain.invoke({
    query: "¿Cuál es el titulo del archivo PDF?",
  });

  console.log({ res });
})();