import os
import openai
import json
import requests
from plugins.common import settings
from revChatGPT.V3 import Chatbot


def chat_init(history):
    return history


def chat_one(prompt, history_formatted, max_length, top_p, temperature, zhishiku=False):
    user_his = " "
    assistant_his = " "
    #print(history_formatted)

    if history_formatted is not None:
        for i, old_chat in enumerate(history_formatted):
            if old_chat['role'] == "user":
                user_his =  old_chat['content']
            elif old_chat['role'] == 'AI':
                assistant_his = old_chat['content']

    resTemp = " "

    text_his = " "
    if user_his !=" " and assistant_his !=" ":
        text_his = f'User: {user_his.strip()}\n\nAssistant: {assistant_his.strip()}' 
    print(text_his)
    
    text_user =  prompt
    text =  text_his + text_user
    question = text.strip()

    # chatbot = Chatbot(proxy = "",api_key="",system_prompt="你是一个有用的人工智能助手，你的名字叫RWKV，由RWKV团队开发的大语言模型.",max_tokens=max_length,temperature=temperature,top_p=top_p,frequency_penalty=0.4,presence_penalty=0.4 )
    # for data in chatbot.ask(question):
    #     resTemp += data
    #     #print(resTemp)
    #     yield resTemp

    
    promopt = f'Question: {text.strip()}Answer:'

    headers = {"Content-type": "application/json"}
    post_data = {"prompt":promopt,"model":"rwkv","stream":False,"temperature":0.5,"max_tokens":800,"top_p":0.95,"frequency_penalty":0,"presence_penalty":0}
    json_data = json.dumps(post_data, indent=2)
    resp = requests.post(url="https://rwkv.ai-creator.net/v1/completions",headers=headers,data=json_data)
    redata = eval(resp.text)
    res = redata["choices"][0]['text'].split("\n\nQuestion: ")[0].strip()

    restmp = ""

    for chunk in res:
        restmp += chunk
        yield restmp


        
chatCompletion = None


def load_model():
    os.environ["API_URL"] = "https://rwkv.ai-creator.net/chntuned/v1/chat/completions"
    #os.environ["API_URL"] = "https://rwkv.ai-creator.net/v1/completions"

class Lock:
    def __init__(self):
        pass

    def get_waiting_threads(self):
        return 0

    def __enter__(self): 
        pass

    def __exit__(self, exc_type, exc_val, exc_tb): 
        pass