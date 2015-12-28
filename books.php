<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2015/12/28
 * Time: 16:21
 */
$books = array(
    array('title' => 'book1'),
    array('title' => 'book2'),
    array('title' => 'book3')
);

echo json_encode($books);

//TODO 判断发来请求类型是GET还是POST 处理对应的fetch和create