import { Button, message, Popconfirm, Popover, Space } from "antd";
import "./index.scss";
import { useCallback, useEffect, useState } from "react";
import {
  examDelete,
  examList,
  examPublish,
  examUnpublish,
} from "../../interfaces";
import { ExamAddModal } from "./ExamAddModal";
import { Link } from "react-router-dom";
import { RankingModal } from "./RankingModal";

interface Exam {
  id: number;
  name: string;
  isPublish: boolean;
  isDelete: boolean;
  content: string;
}

export function ExamList() {
  const [list, setList] = useState<Array<Exam>>([]);
  const [isExamAddModalOpen, setIsExamAddModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [curExamId, setCurExamId] = useState<number>();
  const [bin, setBin] = useState(false);

  const query = useCallback(async () => {
    try {
      const res = await examList();
      if (res.status === 201 || res.status === 200) {
        setList(res.data);
      }
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "系统繁忙，请稍后再试");
    }
  }, []);

  const changePublishState = useCallback(async (id: number, publish: boolean) => {
    try {
      const res = publish ? await examUnpublish(id) : await examPublish(id);
      if (res.status === 201 || res.status === 200) {
        message.success(publish ? "已取消发布" : "已发布");
        query();
      }
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "系统繁忙，请稍后再试");
    }
  }, [query]);

  const deleteExam = useCallback(async (id: number) => {
    try {
      const res = await examDelete(id);
      if (res.status === 201 || res.status === 200) {
        message.success("已删除");
        query();
      }
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message || "系统繁忙，请稍后再试");
    }
  }, [query]);

  useEffect(() => {
    query();
  }, [query]);

  return (
    <div id="ExamList-container">
      <div className="header">
        <h1>考试系统</h1>
      </div>
      <div className="body">
        <div className="operate">
          <Space>
            <Button
              type="primary"
              onClick={() => setIsExamAddModalOpen(true)}
            >
              新建试卷
            </Button>
            <Button
              onClick={() => setBin(prevBin => !prevBin)}
            >
              {bin ? "退出回收站" : "打开回收站"}
            </Button>
          </Space>
        </div>
        <div className="list">
          {list
            ?.filter((item) => bin ? item.isDelete === true : item.isDelete === false)
            .map((item) => (
              <div key={item.id} className="item">
                <p>{item.name}</p>
                <div className="btns">
                  <Button
                    className="btn"
                    type="primary"
                    style={{ background: "darkblue" }}
                    onClick={() => changePublishState(item.id, item.isPublish)}
                  >
                    {item.isPublish ? "停止" : "发布"}
                  </Button>
                  <Button
                    className="btn"
                    type="primary"
                    style={{ background: "green" }}
                  >
                    <Link to={`/edit/${item.id}`}>编辑</Link>
                  </Button>
                  <Popover
                    content={`${window.location.origin}/exam/${item.id}`}
                    trigger="click"
                  >
                    <Button type="default">考试链接</Button>
                  </Popover>
                  <Button
                    className="btn"
                    type="primary"
                    style={{ background: 'orange' }}
                    onClick={() => {
                      setIsRankingModalOpen(true);
                      setCurExamId(item.id);
                    }}
                  >
                    排行榜
                  </Button>
                  <a
                    href={`http://localhost:3003/answer/export?examId=${item.id}`}
                    download
                  >
                    导出所有答卷
                  </a>

                  <Popconfirm
                    title="试卷删除"
                    description="确认放入回收站吗？"
                    onConfirm={() => deleteExam(item.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      className="btn"
                      type="primary"
                      style={{ background: "darkred" }}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
        </div>
      </div>
      <ExamAddModal
        isOpen={isExamAddModalOpen}
        handleClose={() => {
          setIsExamAddModalOpen(false);
          query();
        }}
      />
      <RankingModal
        isOpen={isRankingModalOpen}
        handleClose={() => setIsRankingModalOpen(false)}
        examId={curExamId}
      />

    </div>
  );
}
