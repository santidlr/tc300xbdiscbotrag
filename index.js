import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAI, OpenAIEmbeddings} from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RetrievalQAChain } from "langchain/chains";
import * as fs from "fs";


/* 
/* Load all PDFs within the specified directory */
//const directoryLoader = new DirectoryLoader(
  //  "./PDF/",
   // {
    //  ".pdf": (path) => new PDFLoader(path),
    //}
  //);


  //const docs = await directoryLoader.load();

  //console.log({ docs });
  
  /* Additional steps : Split text into chunks with any TextSplitter. You can then use it as context or save it to memory afterwards. */
  //const textSplitter = new RecursiveCharacterTextSplitter({
    //chunkSize: 1000,
    //chunkOverlap: 200,
  //});
  
  //const splitDocs = await textSplitter.splitDocuments(docs);
  //console.log({ splitDocs });
  import * as dotenv from "dotenv";
  dotenv.config();
  
  const model = new OpenAI({
    model: "gpt-3.5-turbo", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    temperature: 0.9,
    apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  });
const text = fs.readFileSync("text.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

// Create a vector store from the documents.
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

// Initialize a retriever wrapper around the vector store
const vectorStoreRetriever = vectorStore.asRetriever();

// Create a chain that uses the OpenAI LLM and HNSWLib vector store.
const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
const res = await chain.invoke({
  query: "¿Cuáles son los beneficios de la lectura?",
});
console.log({ res });