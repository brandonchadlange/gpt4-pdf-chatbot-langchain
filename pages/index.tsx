import Layout from '@/components/layout';
import LoadingDots from '@/components/ui/LoadingDots';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/providers/auth';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import {
  makePostChat,
  postPurgeDocuments,
  postSendUrl,
  postUploadFiles,
} from '@/utils/mutations';
import { Document } from 'langchain/document';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const DocumentUpload = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const onFilesChange = async (e: any) => {
    const files = Array.from(e.target.files) as File[];
    setLoading(true);

    try {
      await postUploadFiles(files);
    } catch (err: any) {
      alert('an error occured uploading the documents');
      console.log('err', err.response);
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <button
        onClick={() => openFileDialog()}
        className="border px-2 py-1 rounded-md w-40"
      >
        {loading ? <LoadingDots color="#000" /> : 'Upload documents'}
      </button>
      <input
        multiple
        accept="application/pdf,application/vnd.ms-excel,application/JSON,text/csv"
        onChange={onFilesChange}
        ref={fileInputRef}
        type="file"
        className="hidden"
      />
    </div>
  );
};

const AddUrl = () => {
  const [loading, setLoading] = useState(false);

  const promptForUrl = () => {
    const url = prompt('Please enter a url');

    if (url === null || url.trim().length === 0) {
      alert('URL cannot be empty.');
      return;
    }

    sendUrl(url);
  };

  const sendUrl = async (url: string) => {
    setLoading(true);

    try {
      await postSendUrl({
        url,
      });
    } catch (err: any) {
      alert('an error occured purging the documents');
      console.log('err', err.response);
    }
  };

  return (
    <button onClick={promptForUrl} className="border px-2 py-1 rounded-md w-40">
      {loading ? <LoadingDots color="#000" /> : 'Add url'}
    </button>
  );
};

const PurgeDocuments = () => {
  const [loading, setLoading] = useState(false);

  const purgeDocuments = async () => {
    setLoading(true);

    try {
      await postPurgeDocuments();
    } catch (err: any) {
      alert('an error occured purging the documents');
      console.log('err', err.response);
    }
  };

  return (
    <button
      onClick={purgeDocuments}
      className="border px-2 py-1 rounded-md w-40"
    >
      {loading ? <LoadingDots color="#000" /> : 'Purge documents'}
    </button>
  );
};

export default function Home() {
  const auth = useAuth();
  const [model, setModel] = useState<string>('gpt-3.5-turbo');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to know about this document?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const postChat = makePostChat({
    onSuccess(data, question) {
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage',
            message: data.text,
            sourceDocs: data.sourceDocuments,
          },
        ],
        history: [...state.history, [question, data.text]],
      }));

      setLoading(false);
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    },
    onError(response) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    },
  });

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    postChat({
      model,
      question,
      history,
    });
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <Layout>
        {/* <div>
          <p>User: {auth.sub ? auth.sub : 'None'}</p>
        </div> */}
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Chat and Summarize Your Docs
          </h1>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <img
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <img
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'What is this doc about?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
              <div className="flex justify-between w-full mt-3">
                <div className="flex gap-3">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    name="model"
                    id="model"
                    className="border px-2 py-1 rounded-md"
                  >
                    <option value="gpt-3.5-turbo" selected>
                      gpt-3.5-turbo
                    </option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-3.5-turbo-0301">
                      gpt-3.5-turbo-0301
                    </option>
                    <option value="gpt-4-0314">gpt-4-0314</option>
                  </select>
                  <DocumentUpload />
                  <AddUrl />
                </div>
                <div className="flex gap-3">
                  <PurgeDocuments />
                </div>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
        <footer className="m-auto p-4">
          MVP for TPM. Powered by LangChainAI.
        </footer>
      </Layout>
    </>
  );
}
