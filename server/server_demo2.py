#-*- coding: UTF-8 -*-
import json
import web
#使用sqlite3操作数据库
import sqlite3
conn = sqlite3.connect('todos.db')

#添加todo相关的urls
urls = (
    '/', 'index',  #返回首页
    # 处理前端todo的请求,操作对应的todo
    '/todo/(\d+)/', 'todo',
    # 处理前端todo的整体请求,主要是获取所有的todo数据
    '/todo/', 'todos',
)

app = web.application(urls, globals())

class index:
    def GET(self):
        return 'Hello, World!'
#添加接口的处理代码
#把todo改为这样：
class todo:
    def GET(self, todo_id=None):
        cur = conn.cursor()
        cur.execute(sql_query + ' where id=?', (todo_id, ))
        todo = cur.fetchone()
        cur.close()

        # 先用这种比较傻的方式
        context = {
            "id": todo[0],
            "title": todo[1],
            "order": todo[2],
            "done": todo[3],
        }
        return json.dumps(context)

class todos:
    def GET(self):
        result = []
        cur = conn.cursor()
        cur.execute(sql_query)
        todos = cur.fetchall()
        cur.close()

        for todo in todos:
            result.append({
                "id": todo[0],
                "title": todo[1],
                "order": todo[2],
                "done": todo[3],
            })
        return json.dumps(result)

if __name__ == "__main__":
    app.run()