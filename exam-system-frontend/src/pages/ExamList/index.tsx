import { Button, message } from "antd";
import "./index.scss";
import { useEffect, useState } from "react";
import { examList } from "../../interfaces";

interface Exam {
    id: number
    name: string
    isPublish: boolean
    isDelete: boolean
    content: string
}

export function ExamList() {

    const [list, setList] = useState<Array<Exam>>();

    async function query() {
        try {
            const res = await examList();
            if(res.status === 201 || res.status === 200) {
                setList(res.data)
            } 
        } catch(e: any){
            message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
        }
    }

    useEffect(() => {
        query()
    }, []);

    return <div id="ExamList-container">
        <div className="header">
            <h1>考试系统</h1>
        </div>
        <div className="body">
            <div className="operate">
                <Button type="primary">新建试卷</Button>
            </div>
            <div className="list">
                {
                    list?.map(item => {
                        return <div className="item">
                            <p>{item.name}</p>
                            <div className="btns">
                                <Button className="btn" type="primary" style={{background: 'darkblue'}}>{item.isPublish ?  '停止' : '发布' }</Button>
                                <Button className="btn" type="primary" style={{background: 'green'}}>编辑</Button>
                                <Button className="btn" type="primary" style={{background: 'darkred'}}>删除</Button>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}
