#-*- coding: UTF-8 -*-
import json
import web

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
class todo:
    def GET(self, todo_id=None):
        context = {
            "title": "下午3点,coding",
            "order": 0,
            "done": False,
        }
        return json.dumps(context)

#处理整体的请求
class todos:
    def GET(self):
        result = []
        result.append({
            "title": "下午3点,coding",
            "order": 0,
            "done": False,
        })
        return json.dumps(result)

if __name__ == "__main__":
    app.run()