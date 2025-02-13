import { Button, Card, Form, Input, message } from "antd";
import "./index.css";
import { useCallback, useEffect, useState } from "react";
import { list } from "../../interfaces";

interface Book {
  id: number;
  name: string;
  author: string;
  description: string;
  cover: string;
}

export function BookManage() {
  const [bookList, setBookList] = useState<Book[]>([]);
  const [name, setName] = useState<string>("");
  // async function fetchData() {
  //   try {
  //     const data = await list(name);

  //     if(data.status === 201 || data.status === 200) {
  //         setBookList(data.data);
  //     }
  // } catch(e: any) {
  //     message.error(e.response.data.message);
  // }
  // }
  const fetchData = useCallback(async () => {
    try {
      const data = await list(name);
      if (data.status === 201 || data.status === 200) {
        setBookList(data.data);
      }
    } catch (e: any) {
      message.error(e.response.data.message);
    }
  }, [name]);

  useEffect(() => {
    fetchData();
  }, [name,fetchData]);

  async function searchBook(value: { name: string }) {
    setName(value.name);
  }

  return (
    <div id="bookManage">
      <h1>图书管理系统</h1>
      <div className="content">
        <div className="book-search">
          <Form
            name="search"
            layout="inline"
            colon={false}
            onFinish={searchBook}
          >
            <Form.Item label="图书名称" name="name">
              <Input />
            </Form.Item>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit">
                搜索图书
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ background: "green" }}
              >
                添加图书
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="book-list">
          {bookList.map((item) => {
            return (
              <Card
                className="card"
                hoverable
                style={{ width: 300 }}
                cover={
                  <img
                    alt="example"
                    src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                  />
                }
              >
                <h2>{item.name}</h2>
                <div>{item.author}</div>
                <div className="links">
                  <a href="#">详情</a>
                  <a href="#">编辑</a>
                  <a href="#">删除</a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
