// ==UserScript==
// @name         知识库
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  利用知识库回答问题
// @author       lyyyyy
// @match        http://127.0.0.1:17860/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=0.1
// @run-at document-idle
// @grant        none
// ==/UserScript==
get_title_form_md = (s) => {
    console.log(s)
    try {
        return s.match('\\[(.+)\\]')[1]
    } catch {
        return s
    }
}
get_url_form_md = (s) => {
    console.log(s)
    try {
        return s.match('\\((.+)\\)')[1]
    } catch {
        return s
    }
}
window.answer_with_zsk = async (Q) => {
    // lsdh(false)
    app.chat.push({ "role": "user", "content": Q })
    kownladge = (await find(Q, 5)).map(i => ({
        title: get_title_form_md(i.title),
        url: get_url_form_md(i.title),
        content: i.content
    }))
    if (kownladge.length > 0) {
        answer = {
            role: "AI",
            content: "",
            sources: kownladge
        }
        app.chat.push(answer)
        result = []
        for (let i in kownladge) {
            answer.content = '正在查找：' + kownladge[i].title
            if (i > 3) continue
            let prompt = app.zsk_summarize_prompt + '\n' +
                kownladge[i].content + "\n问题：" + Q
            result.push(await send(prompt, keyword = Q, show = false))
        }
        app.chat.pop()
        app.chat.pop()
        let prompt = app.zsk_answer_prompt + '\n' +
            result.join('\n') + "\n问题：" + Q
        return await send(prompt, keyword = Q, show = true, sources = kownladge)
    } else {
        app.chat.pop()
        sources = [{
            title: '未匹配到知识库',
            content: '本次对话内容完全由模型提供'
        }]
        return await send(Q, keyword = Q, show = true, sources = sources)
    }
}


func.push({
    name: "知识库问答",
    question: async () => {
        let Q = app.question

        // lsdh(false)
        kownladge = (await find(Q, app.zsk_step)).map(i => ({
            title: get_title_form_md(i.title),
            url: get_url_form_md(i.title),
            content: i.content
        }))
        if (kownladge.length > 0) {
            // let prompt = 'Instruction: 深刻理解下面提供的信息，根据信息完成问答。\n\nInput: ' +
            // kownladge.map((e, i) => i + 1 + "." + e.content).join('\n') + "\n\nResponse: Question: " + Q+"\nAnswer: "
            let prompt = 'Instruction: 根据以下信息\n' +
            kownladge.map((e, i) => i + 1 + "." + e.content).join('\n') + "\n\nQ：" + Q+"\n\nA: "
            return await send(prompt, keyword = Q, show = true, sources = kownladge)
            // if (app.llm_type == "rwkvapi") {
            //     let prompt = '###Instruction: 深刻理解下面提供的信息，根据信息完成问答。\n\n###Input: ' +
            //         kownladge.map((e, i) => i + 1 + "." + e.content).join('\n') + "\n\n###Response: Question: " + Q+"\nAnswer: "
            //     return await send(prompt, keyword = Q, show = true, sources = kownladge)
            // } else {
    
            //     let prompt = app.zsk_answer_prompt + '\n' +
            //         kownladge.map((e, i) => i + 1 + "." + e.content).join('\n') + "\n问题：" + Q
            //     return await send(prompt, keyword = Q, show = true, sources = kownladge)
            // }
        } else {
            app.chat.pop()
            sources = [{
                title: '未匹配到知识库',
                content: '本次对话内容完全由模型提供'
            }]
            return await send(Q, keyword = Q, show = true, sources = sources)
        }
    }
}
)


