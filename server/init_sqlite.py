#coding:utf-8

import sqlite3

con = sqlite3.connect('todos.db')
cur = con.cursor()

try:
    cur.execute('CREATE TABLE todos(id integer PRIMARY KEY AUTOINCREMENT, title text,_order integer,done boolean default False);')
    con.commit()
except Exception as e:
    print e
cur.execute('INSERT INTO todos(title, _order, done) values("��������3��,coding", 1, 0);')
con.commit()

cur.close()
con.close()