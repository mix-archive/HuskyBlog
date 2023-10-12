<?php

/**
 * 留言页面
 *
 * @package custom
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');

$messagePreview = null;

if ($_GET['id']) {
    $http = new \Typecho\Http\Client();
    $http->setQuery(['id' => $_GET['id']]);
    $http->setMethod(\Typecho\Http\Client::METHOD_GET);
    $http->setTimeout(5);
    $http->send('http://bot:4000/message');

    if ($http->getResponseStatus() === 200) {
        $messagePreview = json_decode($http->getResponseBody(), true)['memory'];
    } else {
        throw new \Exception('Failed to get message preview, reason: ' . $http->getResponseBody());
    }
}

?>


<div id="comments" class="col-mb-12 col-8">
    <?php if ($messagePreview !== null) : ?>
        <div>
            <h3>你的留言</h3>
            <ol class="comment-list">
                <li itemscope="" class="comment-body comment-parent comment-odd comment-by-author">
                    <div class="comment-author" itemprop="creator">
                        <cite class="fn" itemprop="name">
                            <a rel="external nofollow"><?php echo $messagePreview['name'] ?></a>
                        </cite>
                    </div>
                    <div class="comment-content" itemprop="commentText">
                        <p><?php echo $messagePreview['content'] ?></p>
                    </div>
                </li>
            </ol>
        </div>
    <?php endif; ?>
    <div class="respond">
        <h3 id="response"><?php _e('添加新留言'); ?></h3>
        <form method="post" action="/memory/submit" id="comment-form" role="form">
            <p>
                <label for="author" class="required"><?php _e('称呼'); ?></label>
                <input type="text" name="name" id="author" class="text" value="<?php $this->remember('author'); ?>" required />
            </p>
            <p>
                <label for="textarea" class="required"><?php _e('内容'); ?></label>
                <textarea rows="8" cols="50" name="content" id="textarea" class="textarea" required><?php $this->remember('text'); ?></textarea>
            </p>
            <p>
                <label for="textarea" class="required"><?php _e('验证码'); ?></label>
            <div class="cf-turnstile" data-sitekey="0x4AAAAAAALibk91MmiZbrXh"></div>
            </p>
            <p>
                <label>
                    <input type="checkbox" name="receiveMail" value="yes" />
                    立即提交给维护者查看
                </label>
            </p>
            <p>
                <button type="submit" class="submit"><?php _e('提交评论'); ?></button>
            </p>
        </form>
    </div>
</div>


<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>
