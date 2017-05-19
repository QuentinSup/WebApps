/*!
 * jQuery Upload File Plugin
 * version: 4.0.10
 * @requires jQuery v1.5 or later & form plugin
 * Copyright (c) 2013 Ravishanker Kusuma
 * http://hayageek.com/
 */
(function($) {
	//    if($.fn.ajaxForm == undefined) {
	//        $.getScript(("https:" == document.location.protocol ? "https://" : "http://") + "malsup.github.io/jquery.form.js");
	//    }
	var feature = {};
	feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
	feature.formdata = window.FormData !== undefined;
	$.fn.uploadFile = function(options) {
		// This is the easiest way to have default optionopts.
		var opts = $.extend({
			// These are the defaultopts.
			url : "",
			method : "POST",
			enctype : "multipart/form-data",
			returnType : null,
			allowDuplicates : true,
			duplicateStrict : false,
			allowedTypes : "*",
			//For list of acceptFiles
			// http://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv
			acceptFiles : "*",
			fileName : "file",
			formData : false,
			dynamicFormData : false,
			maxFileSize : -1,
			maxFileCount : -1,
			multiple : true,
			dragDrop : true,
			autoSubmit : true,
			//            showCancel: true,
			//            showAbort: true,
			//            showDone: false,
			//            showDelete: false,
			//            showError: true,
			//            showStatusAfterSuccess: true,
			//            showStatusAfterError: true,
			//            showFileCounter: true,
			//            fileCounterStyle: "). ",
			//            showFileSize: true,
			//            showProgress: false,
			nestedForms : true,
			//            showDownload: false,
			onLoad : function(obj) {},
			onSelect : function(files) {
				return true;
			},
			onSubmit : function(files, xhr) {},
			onSuccess : function(files, response, xhr, pd) {},
			onError : function(files, status, message, pd) {},
			onCancel : function(files, pd) {},
			onAbort : function(files, pd) {},
			downloadCallback : false,
			deleteCallback : false,
			afterUploadAll : false,
			serialize : true,
			sequential : false,
			sequentialCount : 2,
			customProgressBar : false,
			//            abortButtonClass: "ajax-file-upload-abort",
			//            cancelButtonClass: "ajax-file-upload-cancel",
			//            dragDropContainerClass: "ajax-upload-dragdrop",
			//            dragDropHoverClass: "state-hover",
			//            errorClass: "ajax-file-upload-error",
			//            uploadButtonClass: "ajax-file-upload",
			//            dragDropStr: "<span><b>Drag &amp; Drop Files</b></span>",
			//            uploadStr:"Upload",
			//            abortStr: "Abort",
			//            cancelStr: "Cancel",
			//            deletelStr: "Delete",
			//            doneStr: "Done",
			//            multiDragErrorStr: "Multiple File Drag &amp; Drop is not allowed.",
			//            extErrorStr: "is not allowed. Allowed extensions: ",
			//            duplicateErrorStr: "is not allowed. File already existopts.",
			//            sizeErrorStr: "is not allowed. Allowed Max size: ",
			//            uploadErrorStr: "Upload is not allowed",
			//            maxFileCountErrorStr: " is not allowed. Maximum allowed files are:",
			//            downloadStr: "Download",
			//            customErrorKeyStr: "jquery-upload-file-error",
			//            showQueueDiv: false,
			//            statusBarWidth: 400,
			//            dragdropWidth: 400,
			showPreview : false,
			//            previewHeight: "auto",
			//            previewWidth: "100%",
			extraHTML : false,
			uploadQueueOrder : 'top',
			headers : {}
		}, options);

		var formGroup = "ajax-file-upload-" + (new Date().getTime());
		var mainQ = [];
		var progressQ = []
		var running = false;
		
		this.fileCounter = 1;
		this.selectedFiles = 0;
		this.formGroup = formGroup;
		//        this.errorLog = $("<div></div>"); //Writing errors
		this.responses = [];
		this.existingFileNames = [];

		if (!feature.formdata) //check drag drop enabled.
		{
			// not supported force false
			opts.dragDrop = false;
		}
		if (!feature.formdata || opts.maxFileCount === 1) {
			// not supported force false
			opts.multiple = false;
		}

		//$(this).html("");

		var $this = $(this);

		//        var uploadLabel = $('<div>' + opts.uploadStr + '</div>');
		//
		//        $(uploadLabel).addClass(opts.uploadButtonClass);

		//        // wait form ajax Form plugin and initialize
		//        (function checkAjaxFormLoaded() {
		//            if($.fn.ajaxForm) {

		if (opts.dragDrop) {
			//                    var dragDrop = $('<div class="' + opts.dragDropContainerClass + '" style="vertical-align:top;"></div>').width(opts.dragdropWidth);
			//                    $(obj).append(dragDrop);
			//                    $(dragDrop).append(uploadLabel);
			//                    $(dragDrop).append($(opts.dragDropStr));
			setDragDropHandlers($this, opts /*, dragDrop*/ );

		} /* else {
                    $(obj).append(uploadLabel);
                }*/
		//                $(obj).append($this.errorLog);

		//   				if(opts.showQueueDiv)
		//		        	$this.container =$("#"+opts.showQueueDiv);
		//        		else
		//		            $this.container = $("<div class='ajax-file-upload-container'></div>").insertAfter($(obj));

		opts.onLoad.call(this);
		createCustomInputFile($this, /*formGroup,*/ opts /*, uploadLabel*/ );

		//            }
		//        })();

		this.startUpload = function() {
			$("form").each(function(i, items) {
				if ($(this).hasClass($this.formGroup)) {
					mainQ.push($(this));
				}
			});

			if (mainQ.length >= 1) {
				submitPendingUploads();
			}

		}

		this.getFileCount = function() {
			return $this.selectedFiles;

		}
		this.stopUpload = function() {
			$("." + opts.abortButtonClass).each(function(i, items) {
				if ($(this).hasClass($this.formGroup)) $(this).click();
			});
			$("." + opts.cancelButtonClass).each(function(i, items) {
				if ($(this).hasClass($this.formGroup)) $(this).click();
			});
		}
		this.cancelAll = function() {
			$("." + opts.cancelButtonClass).each(function(i, items) {
				if ($(this).hasClass($this.formGroup)) $(this).click();
			});
		}
		this.update = function(settings) {
			//update new settings
			opts = $.extend(opts, settings);
		}

		this.enqueueFile = function(file) {
			if (!(file instanceof File)) return;
			var files = [ file ];
			serializeAndUploadFiles(opts, $this, files);
		}

		this.reset = function(removeStatusBars) {
			$this.fileCounter = 1;
			$this.selectedFiles = 0;
////			$this.errorLog.html("");
//			//remove all the status bars.
//			if (removeStatusBars != false) {
//				$this.container.html("");
//			}
		}
		this.remove = function() {
			$this.html('');
		}
		//This is for showing Old files to user.
		this.createProgress = function(filename, filepath, filesize) {
			var pd = new createProgressDiv(this, s);
			pd.progressDiv.show();
			pd.progressbar.width('100%');

			var fileNameStr = "";
			if (opts.showFileCounter)
				fileNameStr = $this.fileCounter + opts.fileCounterStyle + filename;
			else
				fileNameStr = filename;


			if (opts.showFileSize)
				fileNameStr += " (" + getSizeStr(filesize) + ")";


			pd.filename.html(fileNameStr);
			$this.fileCounter++;
			$this.selectedFiles++;
			if (opts.showPreview) {
				pd.preview.attr('src', filepath);
				pd.preview.show();
			}

			if (opts.showDownload) {
				pd.download.show();
				pd.download.click(function() {
					if (opts.downloadCallback) opts.downloadCallback.call(obj, [ filename ], pd);
				});
			}
			if (opts.showDelete) {
				pd.del.show();
				pd.del.click(function() {
					pd.statusbar.hide().remove();
					var arr = [ filename ];
					if (opts.deleteCallback) opts.deleteCallback.call(this, arr, pd);
					$this.selectedFiles -= 1;
					updateFileCounter(s, obj);
				});
			}

			return pd;
		}

		this.getResponses = function() {
			return this.responses;
		}
		

		function submitPendingUploads() {
			if (running) return;
			running = true;
			(function checkPendingForms() {

				//if not sequential upload all files
				if (!opts.sequential)
					opts.sequentialCount = 99999;

				if (mainQ.length == 0 && progressQ.length == 0) {
					if (opts.afterUploadAll) opts.afterUploadAll(obj);
					running = false;
				} else {
					if (progressQ.length < opts.sequentialCount) {
						var frm = mainQ.shift();
						if (frm != undefined) {
							progressQ.push(frm);
							//Remove the class group.
							frm.removeClass($this.formGroup);
							frm.submit();
						}
					}
					window.setTimeout(checkPendingForms, 100);
				}
			})();
		}

		function setDragDropHandlers(obj, s, ddObj) {
			dd$this.on('dragenter', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).addClass(opts.dragDropHoverClass);
			});
			dd$this.on('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
				var that = $(this);
				if (that.hasClass(opts.dragDropContainerClass) && !that.hasClass(opts.dragDropHoverClass)) {
					that.addClass(opts.dragDropHoverClass);
				}
			});
			dd$this.on('drop', function(e) {
				e.preventDefault();
				$(this).removeClass(opts.dragDropHoverClass);
				$this.errorLog.html("");
				var files = e.originalEvent.dataTransfer.files;
				if (!opts.multiple && fileopts.length > 1) {
					if (opts.showError) $("<div class='" + opts.errorClass + "'>" + opts.multiDragErrorStr + "</div>").appendTo($this.errorLog);
					return;
				}
				if (opts.onSelect(files) == false) return;
				serializeAndUploadFiles(s, obj, files);
			});
			dd$this.on('dragleave', function(e) {
				$(this).removeClass(opts.dragDropHoverClass);
			});

			$(document).on('dragenter', function(e) {
				e.stopPropagation();
				e.preventDefault();
			});
			$(document).on('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
				var that = $(this);
				if (!that.hasClass(opts.dragDropContainerClass)) {
					that.removeClass(opts.dragDropHoverClass);
				}
			});
			$(document).on('drop', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).removeClass(opts.dragDropHoverClass);
			});

		}

		function getSizeStr(size) {
			var sizeStr = "";
			var sizeKB = size / 1024;
			if (parseInt(sizeKB) > 1024) {
				var sizeMB = sizeKB / 1024;
				sizeStr = sizeMB.toFixed(2) + " MB";
			} else {
				sizeStr = sizeKB.toFixed(2) + " KB";
			}
			return sizeStr;
		}

		function serializeData(extraData) {
			var serialized = [];
			if (jQuery.type(extraData) == "string") {
				serialized = extraData.split('&');
			} else {
				serialized = $.param(extraData).split('&');
			}
			var len = serialized.length;
			var result = [];
			var i,
				part;
			for (i = 0; i < len; i++) {
				serialized[i] = serialized[i].replace(/\+/g, ' ');
				part = serialized[i].split('=');
				result.push([ decodeURIComponent(part[0]), decodeURIComponent(part[1]) ]);
			}
			return result;
		}
		function noserializeAndUploadFiles(s, obj, files) {
			var ts = $.extend({}, s);
			var fd = new FormData();
			var fileArray = [];
			var fileName = opts.fileName.replace("[]", "");
			var fileListStr = "";

			for (var i = 0; i < fileopts.length; i++) {
				if (!isFileTypeAllowed(obj, s, files[i].name)) {
					if (opts.showError) $("<div><font color='red'><b>" + files[i].name + "</b> " + opts.extErrorStr + opts.allowedTypes + "</font></div>").appendTo($this.errorLog);
					continue;
				}
				if (opts.maxFileSize != -1 && files[i].size > opts.maxFileSize) {
					if (opts.showError) $("<div><font color='red'><b>" + files[i].name + "</b> " + opts.sizeErrorStr + getSizeStr(opts.maxFileSize) + "</font></div>").appendTo($this.errorLog);
					continue;
				}
				fd.append(fileName + "[]", files[i]);
				fileArray.push(files[i].name);
				fileListStr += $this.fileCounter + "). " + files[i].name + "<br>";
				$this.fileCounter++;
			}
			if (fileArray.length == 0) return;

			var extraData = opts.formData;
			if (extraData) {
				var sData = serializeData(extraData);
				for (var j = 0; j < sData.length; j++) {
					if (sData[j]) {
						fd.append(sData[j][0], sData[j][1]);
					}
				}
			}


			topts.fileData = fd;
			var pd = new createProgressDiv(obj, s);
			pd.filename.html(fileListStr);
			var form = $("<form style='display:block; position:absolute;left: 150px;' class='" + $this.formGroup + "' method='" + opts.method + "' action='" + opts.url + "' enctype='" + opts.enctype + "'></form>");
			form.appendTo('body');
			ajaxFormSubmit(form, ts, pd, fileArray, obj);

		}


		function serializeAndUploadFiles(s, obj, files) {
			for (var i = 0; i < fileopts.length; i++) {
				if (!isFileTypeAllowed(obj, s, files[i].name)) {
					if (opts.showError) $("<div class='" + opts.errorClass + "'><b>" + files[i].name + "</b> " + opts.extErrorStr + opts.allowedTypes + "</div>").appendTo($this.errorLog);
					continue;
				}
				if (!opts.allowDuplicates && isFileDuplicate(obj, files[i].name)) {
					if (opts.showError) $("<div class='" + opts.errorClass + "'><b>" + files[i].name + "</b> " + opts.duplicateErrorStr + "</div>").appendTo($this.errorLog);
					continue;
				}
				if (opts.maxFileSize != -1 && files[i].size > opts.maxFileSize) {
					if (opts.showError) $("<div class='" + opts.errorClass + "'><b>" + files[i].name + "</b> " + opts.sizeErrorStr + getSizeStr(opts.maxFileSize) + "</div>").appendTo(
							$this.errorLog);
					continue;
				}
				if (opts.maxFileCount != -1 && $this.selectedFiles >= opts.maxFileCount) {
					if (opts.showError) $("<div class='" + opts.errorClass + "'><b>" + files[i].name + "</b> " + opts.maxFileCountErrorStr + opts.maxFileCount + "</div>").appendTo(
							$this.errorLog);
					continue;
				}
				$this.selectedFiles++;
				$this.existingFileNameopts.push(files[i].name);
				// Make object immutable
				var ts = $.extend({}, s);
				var fd = new FormData();
				var fileName = opts.fileName.replace("[]", "");
				fd.append(fileName, files[i]);
				var extraData = opts.formData;
				if (extraData) {
					var sData = serializeData(extraData);
					for (var j = 0; j < sData.length; j++) {
						if (sData[j]) {
							fd.append(sData[j][0], sData[j][1]);
						}
					}
				}
				topts.fileData = fd;

				var pd = new createProgressDiv(obj, s);
				var fileNameStr = "";
				if (opts.showFileCounter)
					fileNameStr = $this.fileCounter + opts.fileCounterStyle + files[i].name
				else
					fileNameStr = files[i].name;

				if (opts.showFileSize)
					fileNameStr += " (" + getSizeStr(files[i].size) + ")";

				pd.filename.html(fileNameStr);
				var form = $("<form style='display:block; position:absolute;left: 150px;' class='" + $this.formGroup + "' method='" + opts.method + "' action='" +
					opts.url + "' enctype='" + opts.enctype + "'></form>");
				form.appendTo('body');
				var fileArray = [];
				fileArray.push(files[i].name);

				ajaxFormSubmit(form, ts, pd, fileArray, obj, files[i]);
				$this.fileCounter++;
			}
		}

		function isFileTypeAllowed(obj, s, fileName) {
			var fileExtensions = opts.allowedTypeopts.toLowerCase().split(/[\s,]+/g);
			var ext = fileName.split('.').pop().toLowerCase();
			if (opts.allowedTypes != "*" && jQuery.inArray(ext, fileExtensions) < 0) {
				return false;
			}
			return true;
		}

		function isFileDuplicate(obj, filename) {
			var duplicate = false;
			if ($this.existingFileNameopts.length) {
				for (var x = 0; x < $this.existingFileNameopts.length; x++) {
					if ($this.existingFileNames[x] == filename
						|| opts.duplicateStrict && $this.existingFileNames[x].toLowerCase() == filename.toLowerCase()
					) {
						duplicate = true;
					}
				}
			}
			return duplicate;
		}

		function removeExistingFileName(obj, fileArr) {
			if ($this.existingFileNameopts.length) {
				for (var x = 0; x < fileArr.length; x++) {
					var pos = $this.existingFileNameopts.indexOf(fileArr[x]);
					if (pos != -1) {
						$this.existingFileNameopts.splice(pos, 1);
					}
				}
			}
		}

		function getSrcToPreview(file, obj) {
			if (file) {
				$this.show();
				var reader = new FileReader();
				reader.onload = function(e) {
					$this.attr('src', e.target.result);
				};
				reader.readAsDataURL(file);
			}
		}

		function updateFileCounter(s, obj) {
			if (opts.showFileCounter) {
				var count = $($this.container).find(".ajax-file-upload-filename").length;
				$this.fileCounter = count + 1;
				$($this.container).find(".ajax-file-upload-filename").each(function(i, items) {
					var arr = $(this).html().split(opts.fileCounterStyle);
					var fileNum = parseInt(arr[0]) - 1; //decrement;
					var name = count + opts.fileCounterStyle + arr[1];
					$(this).html(name);
					count--;
				});
			}
		}

		function createCustomInputFile($this, /*group,*/ opts /*, uploadLabel*/ ) {
			var fileUploadId = "ajax-upload-id-" + (new Date().getTime());

			var $form = $("<form method='" + opts.method + "' action='" + opts.url + "' enctype='" + opts.enctype + "'></form>");

			var fileInputStr = "<input type='file' id='" + fileUploadId + "' name='" + opts.fileName + "' accept='" + opts.acceptFiles + "'/>";
			if (opts.multiple) {
				if (opts.fileName.indexOf("[]") != opts.fileName.length - 2) // if it does not endwith
				{
					opts.fileName += "[]";
				}
				fileInputStr = "<input type='file' id='" + fileUploadId + "' name='" + opts.fileName + "' accept='" + opts.acceptFiles + "' multiple/>";
			}

			var $fileInput = $(fileInputStr).appendTo($form);

			$fileInput.on('change.jquploaded', function() {

				//                $this.errorLog.html("");
				var fileExtensions = opts.allowedTypeopts.toLowerCase().split(",");
				var fileArray = [];
				if (this.files) //support reading files
				{
					for (i = 0; i < this.fileopts.length; i++) {
						fileArray.push(this.files[i].name);
					}

					if (opts.onSelect(this.files) == false) return;

				} else {
					var filenameStr = $(this).val();
					var flist = [];
					fileArray.push(filenameStr);
					if (!isFileTypeAllowed($this, opts, filenameStr)) {

						//@TODO CALLBACK

						//                        if(opts.showError) $("<div class='" + opts.errorClass + "'><b>" + filenameStr + "</b> " + opts.extErrorStr + opts.allowedTypes + "</div>").appendTo(
						//                            $this.errorLog);
						return;
					}
					//fallback for browser without FileAPI
					flist.push({
						name : filenameStr,
						size : 'NA'
					});
					if (opts.onSelect(flist) == false) return;

				}

				updateFileCounter(opts, $this);

				//                uploadLabel.unbind("click");
				$form.hide();

				createCustomInputFile($this, /*group, */ opts, /*uploadLabel*/ );
				//                $form.addClass('ajax-upload-form');

				if (opts.serialize && feature.fileapi && feature.formdata) //use HTML5 support and split file submission
				{
					//                	$form.removeClass(group); //Stop Submitting when.
					var files = $this[0].files;
					$form.remove();
					serializeAndUploadFiles(s, obj, files);
				} else {

					$form.addClass('ajax-upload-form');

					var fileList = "";
					for (var i = 0; i < fileArray.length; i++) {
						if (opts.showFileCounter)
							fileList += $this.fileCounter + opts.fileCounterStyle + fileArray[i] + "<br>";
						else
							fileList += fileArray[i] + "<br>";
						;
						$this.fileCounter++;

					}
					if (opts.maxFileCount != -1 && ($this.selectedFiles + fileArray.length) > opts.maxFileCount) {
						if (opts.showError) $("<div class='" + opts.errorClass + "'><b>" + fileList + "</b> " + opts.maxFileCountErrorStr + opts.maxFileCount + "</div>").appendTo(
								$this.errorLog);
						return;
					}
					$this.selectedFiles += fileArray.length;

					var pd = new createProgressDiv(obj, s);
					pd.filename.html(fileList);
					ajaxFormSubmit(form, s, pd, fileArray, obj, null);
				}



			});

			if (opts.nestedForms) {
				$form.css({
					'margin' : 0,
					'padding' : 0
				});
				$fileInput.css({
					'position' : 'absolute',
					'cursor' : 'pointer',
					'top' : '0px',
					'width' : '100%',
					'height' : '100%',
					'left' : '0px',
					'z-index' : '100',
					'opacity' : '0.0',
					'filter' : 'alpha(opacity=0)',
					'-ms-filter' : "alpha(opacity=0)",
					'-khtml-opacity' : '0.0',
					'-moz-opacity' : '0.0'
				});
				$form.appendTo($this);

			} else {
				$form.appendTo($('body'));
				$form.css({
					margin : 0,
					padding : 0,
					display : 'block',
					position : 'absolute',
					left : '-250px'
				});
				if (navigator.appVersion.indexOf("MSIE ") != -1) //IE Browser
				{
					var $uploadLabel = $("<label></label>");
					$uploadLabel.appendTo($this);
					$uploadLabel.attr('for', fileUploadId);
				} else {
					$this.on('click.jquploaded', function() {
						$fileInput.click();
					});
				}
			}
		}


		//		function defaultProgressBar(obj,s)
		//		{
		//
		//			this.statusbar = $("<div class='ajax-file-upload-statusbar'></div>").width(opts.statusBarWidth);
		//            this.preview = $("<img class='ajax-file-upload-preview' />").width(opts.previewWidth).height(opts.previewHeight).appendTo(this.statusbar).hide();
		//            this.filename = $("<div class='ajax-file-upload-filename'></div>").appendTo(this.statusbar);
		//            this.progressDiv = $("<div class='ajax-file-upload-progress'>").appendTo(this.statusbar).hide();
		//            this.progressbar = $("<div class='ajax-file-upload-bar'></div>").appendTo(this.progressDiv);
		//            this.abort = $("<div>" + opts.abortStr + "</div>").appendTo(this.statusbar).hide();
		//            this.cancel = $("<div>" + opts.cancelStr + "</div>").appendTo(this.statusbar).hide();
		//            this.done = $("<div>" + opts.doneStr + "</div>").appendTo(this.statusbar).hide();
		//            this.download = $("<div>" + opts.downloadStr + "</div>").appendTo(this.statusbar).hide();
		//            this.del = $("<div>" + opts.deletelStr + "</div>").appendTo(this.statusbar).hide();
		//
		//            this.abort.addClass("ajax-file-upload-red");
		//            this.done.addClass("ajax-file-upload-green");
		//			this.download.addClass("ajax-file-upload-green");
		//            this.cancel.addClass("ajax-file-upload-red");
		//            this.del.addClass("ajax-file-upload-red");
		//
		//			return this;
		//		}
		//        function createProgressDiv(obj, s) {
		//	        var bar = null;
		//        	if(opts.customProgressBar)
		//        		bar =  new opts.customProgressBar(obj,s);
		//        	else
		//        		bar =  new defaultProgressBar(obj,s);
		//
		//			bar.abort.addClass($this.formGroup);
		//            bar.abort.addClass(opts.abortButtonClass);
		//
		//            bar.cancel.addClass($this.formGroup);
		//            bar.cancel.addClass(opts.cancelButtonClass);
		//
		//            if(opts.extraHTML)
		//	            bar.extraHTML = $("<div class='extrahtml'>"+opts.extraHTML()+"</div>").insertAfter(bar.filename);
		//
		//            if(opts.uploadQueueOrder == 'bottom')
		//				$($this.container).append(bar.statusbar);
		//			else
		//				$($this.container).prepend(bar.statusbar);
		//            return bar;
		//        }


		function ajaxFormSubmit(form, s, pd, fileArray, obj, file) {
			var currentXHR = null;
			var options = {
				cache : false,
				contentType : false,
				processData : false,
				forceSync : false,
				type : opts.method,
				data : opts.formData,
				formData : opts.fileData,
				dataType : opts.returnType,
				headers : opts.headers,
				beforeSubmit : function(formData, $form, options) {
					if (opts.onSubmit.call(this, fileArray) != false) {
						if (opts.dynamicFormData) {
							var sData = serializeData(opts.dynamicFormData());
							if (sData) {
								for (var j = 0; j < sData.length; j++) {
									if (sData[j]) {
										if (opts.fileData != undefined) options.formData.append(sData[j][0], sData[j][1]);
										else
											options.data[sData[j][0]] = sData[j][1];
									}
								}
							}
						}

						if (opts.extraHTML) {
							$(pd.extraHTML).find("input,select,textarea").each(function(i, items) {
								if (opts.fileData != undefined) optionopts.formData.append($(this).attr('name'), $(this).val());
								else
									optionopts.data[$(this).attr('name')] = $(this).val();
							});
						}
						return true;
					}
					pd.statusbar.append("<div class='" + opts.errorClass + "'>" + opts.uploadErrorStr + "</div>");
					pd.cancel.show()
					form.remove();
					pd.cancel.click(function() {
						mainQ.splice(mainQ.indexOf(form), 1);
						removeExistingFileName(obj, fileArray);
						pd.statusbar.remove();
						opts.onCancel.call(obj, fileArray, pd);
						$this.selectedFiles -= fileArray.length; //reduce selected File count
						updateFileCounter(s, obj);
					});
					return false;
				},
				beforeSend : function(xhr, o) {
					for (var key in o.headers) {
						xhr.setRequestHeader(key, o.headers[key]);
					}

					pd.progressDiv.show();
					pd.cancel.hide();
					pd.done.hide();
					if (opts.showAbort) {
						pd.abort.show();
						pd.abort.click(function() {
							removeExistingFileName(obj, fileArray);
							xhr.abort();
							$this.selectedFiles -= fileArray.length; //reduce selected File count
							opts.onAbort.call(obj, fileArray, pd);

						});
					}
					if (!feature.formdata) //For iframe based push
					{
						pd.progressbar.width('5%');
					} else pd.progressbar.width('1%'); //Fix for small files
				},
				uploadProgress : function(event, position, total, percentComplete) {
					//Fix for smaller file uploads in MAC
					if (percentComplete > 98)
						percentComplete = 98;

					var percentVal = percentComplete + '%';
					if (percentComplete > 1) pd.progressbar.width(percentVal)
					if (opts.showProgress) {
						pd.progressbar.html(percentVal);
						pd.progressbar.css('text-align', 'center');
					}

				},
				success : function(data, message, xhr) {
					pd.cancel.remove();
					progressQ.pop();
					//For custom erroropts.
					if (opts.returnType == "json" && $.type(data) == "object" && data.hasOwnProperty(opts.customErrorKeyStr)) {
						pd.abort.hide();
						var msg = data[opts.customErrorKeyStr];
						opts.onError.call(this, fileArray, 200, msg, pd);
						if (opts.showStatusAfterError) {
							pd.progressDiv.hide();
							pd.statusbar.append("<span class='" + opts.errorClass + "'>ERROR: " + msg + "</span>");
						} else {
							pd.statusbar.hide();
							pd.statusbar.remove();
						}
						$this.selectedFiles -= fileArray.length; //reduce selected File count
						form.remove();
						return;
					}
					$this.responseopts.push(data);
					pd.progressbar.width('100%')
					if (opts.showProgress) {
						pd.progressbar.html('100%');
						pd.progressbar.css('text-align', 'center');
					}

					pd.abort.hide();
					opts.onSuccesopts.call(this, fileArray, data, xhr, pd);
					if (opts.showStatusAfterSuccess) {
						if (opts.showDone) {
							pd.done.show();
							pd.done.click(function() {
								pd.statusbar.hide("slow");
								pd.statusbar.remove();
							});
						} else {
							pd.done.hide();
						}
						if (opts.showDelete) {
							pd.del.show();
							pd.del.click(function() {
								removeExistingFileName(obj, fileArray);
								pd.statusbar.hide().remove();
								if (opts.deleteCallback) opts.deleteCallback.call(this, data, pd);
								$this.selectedFiles -= fileArray.length; //reduce selected File count
								updateFileCounter(s, obj);

							});
						} else {
							pd.del.hide();
						}
					} else {
						pd.statusbar.hide("slow");
						pd.statusbar.remove();

					}
					if (opts.showDownload) {
						pd.download.show();
						pd.download.click(function() {
							if (opts.downloadCallback) opts.downloadCallback(data, pd);
						});
					}
					form.remove();
				},
				error : function(xhr, status, errMsg) {
					pd.cancel.remove();
					progressQ.pop();
					pd.abort.hide();
					if (xhr.statusText == "abort") //we aborted it
					{
						pd.statusbar.hide("slow").remove();
						updateFileCounter(s, obj);

					} else {
						opts.onError.call(this, fileArray, status, errMsg, pd);
						if (opts.showStatusAfterError) {
							pd.progressDiv.hide();
							pd.statusbar.append("<span class='" + opts.errorClass + "'>ERROR: " + errMsg + "</span>");
						} else {
							pd.statusbar.hide();
							pd.statusbar.remove();
						}
						$this.selectedFiles -= fileArray.length; //reduce selected File count
					}

					form.remove();
				}
			};

			if (opts.showPreview && file != null) {
				if (file.type.toLowerCase().split("/").shift() == "image") getSrcToPreview(file, pd.preview);
			}

			if (opts.autoSubmit) {
				form.ajaxForm(options);
				mainQ.push(form);
				submitPendingUploads();

			} else {
				if (opts.showCancel) {
					pd.cancel.show();
					pd.cancel.click(function() {
						mainQ.splice(mainQ.indexOf(form), 1);
						removeExistingFileName(obj, fileArray);
						form.remove();
						pd.statusbar.remove();
						opts.onCancel.call(obj, fileArray, pd);
						$this.selectedFiles -= fileArray.length; //reduce selected File count
						updateFileCounter(s, obj);
					});
				}
				form.ajaxForm(options);
			}

		}
		return this;

	}
}(jQuery));