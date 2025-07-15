import { Modal, Table, type TableColumnsType, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { ranking } from "../../interfaces";

// 定义排行榜数据类型
interface RankingItem {
    id: number;
    score: number;
    answerer: {
        id: number;
        username: string;
    };
    exam: {
        id: number;
        name: string;
    };
}

interface RankingModalProps {
    isOpen: boolean;
    handleClose: () => void;
    examId?: number;
}

export function RankingModal(props: RankingModalProps) {
    const [list, setList] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(false);

    const query = useCallback(async () => {
        if (!props.examId) {
            return;
        }

        setLoading(true);
        try {
            const res = await ranking(props.examId);

            if (res.status === 201 || res.status === 200) {
                setList(res.data);
            }
        } catch (e: unknown) {
            const error = e as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || '系统繁忙，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, [props.examId]);

    useEffect(() => {
        query();
    }, [query]);

    const columns: TableColumnsType<RankingItem> = [
        {
            title: '排名',
            key: 'rank',
            width: 80,
            render: (_, __, index) => (
                <span style={{ fontWeight: 'bold' }}>
                    {index + 1}
                </span>
            )
        },
        {
            title: '姓名',
            key: 'name',
            dataIndex: ['answerer', 'username'],
            render: (username: string) => (
                <span>{username}</span>
            )
        },
        {
            title: '分数',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            render: (score: number) => (
                <span style={{ fontWeight: 'bold', color: score >= 80 ? '#52c41a' : '#1890ff' }}>
                    {score}
                </span>
            )
        }
    ];

    return (
        <Modal
            title="考试排行榜"
            open={props.isOpen}
            onOk={props.handleClose}
            onCancel={props.handleClose}
            okText="确认"
            cancelText="取消"
            width={600}
        >
            <Table
                dataSource={list}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={false}
                size="middle"
            />
        </Modal>
    );
}
