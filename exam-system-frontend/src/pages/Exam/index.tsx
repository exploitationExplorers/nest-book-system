import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Question } from "../Edit";
import { answerAdd, examFind } from "../../interfaces";
import { Button, Checkbox, Input, message, Radio } from "antd";
import './index.scss';

export function Exam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [json, setJson] = useState<Array<Question>>([]);
    const [answers, setAnswers] = useState<Array<{ id: number, answer?: string}>>([]);

    const query = useCallback(async () => {
        if (!id) {
            return;
        }
        try {
            const res = await examFind(+id);
            if (res.status === 201 || res.status === 200) {
                try {
                    const content = JSON.parse(res.data.content);
                    setJson(content);
                    setAnswers(content.map((item: {id: number}) => ({
                        id: item.id,
                        answer: ''
                    })));
                } catch (e) {
                    console.error('Failed to parse exam content:', e);
                    message.error('考试内容格式错误');
                }
            }
        } catch (e: unknown) {
            const error = e as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || '系统繁忙，请稍后再试');
        }
    }, [id]);

    useEffect(() => {
        query();
    }, [query]);


    const setAnswer = useCallback((id: number, value: string) => {
        setAnswers(prevAnswers => prevAnswers.map(item =>
            item.id === id ? { id, answer: value } : item
        ));
    }, []);

    const addAnswer = useCallback(async () => {
        if (!id) {
            return;
        }
        try {
            const res = await answerAdd({
                examId: +id,
                content: JSON.stringify(answers)
            });

            if (res.status === 201 || res.status === 200) {
                message.success('提交成功');
                navigate('/res/' + res.data.id);
            }
        } catch (e: unknown) {
            const error = e as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || '系统繁忙，请稍后再试');
        }
    }, [answers, id, navigate]);

    const renderComponents = useCallback((arr: Array<Question>) => {
        return arr.map((item) => {
            let formComponent;
            if (item.type === 'radio') {
                formComponent = (
                    <Radio.Group onChange={(e) => {
                        setAnswer(item.id, e.target.value);
                    }}>
                        {item.options?.map((option, index) => (
                            <Radio key={index} value={option}>{option}</Radio>
                        ))}
                    </Radio.Group>
                );
            } else if (item.type === 'checkbox') {
                formComponent = (
                    <Checkbox.Group
                        options={item.options}
                        onChange={(values) => {
                            setAnswer(item.id, values.join(','));
                        }}
                    />
                );
            } else if (item.type === 'input') {
                formComponent = (
                    <Input onChange={(e) => {
                        setAnswer(item.id, e.target.value);
                    }}/>
                );
            }

            return (
                <div className="component-item" key={item.id}>
                    <p className="question">{item.question}</p>
                    <div className="options">
                        {formComponent}
                    </div>
                </div>
            );
        });
    }, [setAnswer]);

    return (
        <div className="exam-container">
            {renderComponents(json)}
            <Button
                type="primary"
                className="btn"
                onClick={addAnswer}
            >
                提交
            </Button>
        </div>
    );
}