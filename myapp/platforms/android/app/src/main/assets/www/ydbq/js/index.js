$(function () {
    var localUpdateJson

    document.addEventListener('deviceready', function () {
        // 配置文件地址, 可获取远程url的路径
        var SERVER_PATH = 'http://10.1.64.42:9082/insure-pad/www/update.json'

        if (!localStorage.localUpdateJsonStr) {
            localUpdateJson = { version: "0.0.0" }
            localStorage.localUpdateJsonStr = JSON.stringify(localUpdateJson)
        } else {
            localUpdateJson = JSON.parse(localStorage.localUpdateJsonStr)
        }

        // 显示当前版本
        log('');

        // if (navigator.userAgent.indexOf('ANDROID') != -1 || ) {
        var PLATFORM = 'android'
        checkUpdate();

        function checkUpdate() {
            $.ajax({
                url: SERVER_PATH,
                data: {
                    platform: PLATFORM,
                    version: localUpdateJson.version,
                },
                type: 'GET',
                dataType: 'json',
                timeout: 6000, //超时时间设置，单位毫秒
                success: function (serverUpdateJson) {
                    // HTML资源包有更新
                    if (localUpdateJson.version < serverUpdateJson.version) {
                        if (serverUpdateJson.force_update) {
                            downAndUnZip(serverUpdateJson, updateCallBack)
                        } else {
                            sino_file.isExist(cordova.file.dataDirectory + localUpdateJson.extract_dir +
                                localUpdateJson.index_html, function (result) {
                                    if (result.isExist === 1) {
                                        navigator.notification.confirm('检测到新版本, 是否现在升级?', function (choice) {
                                            // OK:1, Cancel: 2
                                            if (choice === 1) {
                                                downAndUnZip(serverUpdateJson, updateCallBack)
                                            } else {
                                                updateCallBack(true)
                                            }
                                        }, '提示')
                                    } else {
                                        downAndUnZip(serverUpdateJson, updateCallBack)
                                    }
                                }, function () {
                                    downAndUnZip(serverUpdateJson, updateCallBack)
                                }
                            )
                        }
                    } else {
                        updateCallBack(true)
                    }
                },
                error: function (xmlHttpRequest, statusText, errorThrown) {
                    var errorText
                    if ('timeout' === errorThrown) {
                        errorText = '连接服务器超时'
                    } else {
                        errorText = '连接服务器失败'
                    }
                    log(errorText)
                    $('#outtips').show()
                    updateCallBack(false, errorText)
                }
            });
        }

        function updateCallBack(flag, text) {
            if (flag) {
                text = text || '更新成功'
                log(text);
                location.href = cordova.file.dataDirectory + localUpdateJson.extract_dir +
                    localUpdateJson.index_html;
            } else {
                text = text || '更新失败'
                log(text);
                navigator.notification.confirm(text + ', 是否重试?', function (choice) {
                    // OK:1, Cancel: 2
                    if (choice === 1) {
                        checkUpdate()
                    }
                }, '提示')
            }
        }

        /**
         * 下载更新包 并解压 完成后调用回调函数
         * @param  {[type]}   object
         * @param  {Function} onCallBack
         */
        function downAndUnZip(object, onCallBack) {
            var fileTransfer = new FileTransfer()
            fileTransfer.onprogress = function (progressEvent) {
                log('下载' + object.type_name +
                    Math.floor(100 * progressEvent.loaded / progressEvent.total) + "%");
            };

            //下载更新包
            fileTransfer.download(object.downlown_url, cordova.file.dataDirectory
                + object.downlown_path,
                onDownloadSuccess, onDownloadError, true)

            function onDownloadSuccess(fileEntry) {
                log('下载' + object.type_name + '成功')
                unzip(fileEntry.toURL(), object, onCallBack)

                /**
                 * 
                 * @param {*} filePath 源文件路径
                 * @param {*} object
                 * @param {*} onCallBack 回调 
                 */
                function unzip(filePath, object, onCallBack) {
                    //解压更新包文件
                    var UNZIP_PATH = cordova.file.dataDirectory + object.extract_dir
                    sino_file.delete(UNZIP_PATH, success, success)
                    function success() {
                        zip.unzip(filePath, UNZIP_PATH, function (data) {
                            // OK
                            if (data == 0) {
                                // 解压完成后更新本地保存的版本号
                                localUpdateJson = object
                                localStorage.localUpdateJsonStr = JSON.stringify(localUpdateJson)
                                onCallBack(true, '解压' + object.type_name + '成功');
                            } else {
                                onCallBack(false, '解压' + object.type_name + '失败')
                            }
                        }, function (progressEvent) {
                            log('解压' + object.type_name + ':' + Math.floor((progressEvent.loaded / progressEvent.total) * 100)
                                + "%");
                        });
                    }
                }
            }

            function onDownloadError(error) {
                var errorText = '下载' + object.type_name + '失败'
                onCallBack(false, errorText)
            }
        }
    });

    function log(msg) {
        console.log(msg)
        $('#result').html('当前版本为' + localUpdateJson.version + '<br />' + msg)
    }
});