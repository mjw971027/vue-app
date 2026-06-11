$(document).ready(pageInit);

function pageInit() {
    mini.parse();
    page.init();
    page.dataBind();
    page.eventBind();
}

var page = {
    init: function () {
        this.tool = new PageTool();
        this.ip = this.tool.getSiteIp();
        this.url = this.ip + "/components";
        this.txtAppNo = mini.get("txtAppNo");
        this.txtCom = mini.get("txtCom");
        this.txtDept = mini.get("txtDept");
        this.txtAppUser = mini.get("txtAppUser");
        this.dateApp = mini.get("dateApp");
        this.cmbProjNo = mini.get("cmbProjNo");
        this.cmbDiv = mini.get("cmbDiv");
        this.txtNeedSum = mini.get("txtNeedSum");
        this.txtTel = mini.get("txtTel");
        this.dateNeed = mini.get("dateNeed");
        this.cmbDiv = mini.get("cmbDiv");
        this.txtDwg = mini.get("txtDwg");
        this.txtMaterialCost = mini.get("txtMaterialCost");
        this.txtLastIss = mini.get("txtLastIss");
        this.txtLaborHour = mini.get("txtLaborHour");
        this.txtProgram = mini.get("txtProgram");
        this.txtRemark = mini.get("txtRemark");
        this.radioAidot = mini.get("radioAidot");
        this.dataGrid1 = mini.get("dataGrid1");
        this.btnAppAdd = mini.get("btnAppAdd");
        this.btnAppDel = mini.get("btnAppDel");
        this.dataGrid2 = mini.get("dataGrid2");
        this.btnUpload = mini.get("btnUpload");
        this.btnFileDel = mini.get("btnFileDel");
        this.dataGrid3 = mini.get("dataGrid3");
        this.btnSave = mini.get("btnSave");
        this.btnCommit = mini.get("btnCommit");
        this.combReviewer = mini.get("combReviewer");
        this.importFileWindow = mini.get("importFileWindow");
        this.fileSelectInput = mini.get("fileSelectInput");
        this.btnImportOk = mini.get("btnImportOk");
    },
    dataBind: function () {

    },
    eventBind: function () {
        this.btnAppAdd.on('click', this.tool.myBind(this.appAdd, page));
        this.txtNeedSum.on('valuechanged',this.tool.myBind(this.needChange,page));
        this.btnAppDel.on('click', this.tool.myBind(this.appDel, page));
        this.btnUpload.on('click', this.tool.myBind(this.uploadfile, page));
        this.btnFileDel.on('click', this.tool.myBind(this.delComFile, page));
        this.btnSave.on('click', this.tool.myBind(this.saveData, page));
        this.btnCommit.on('click', this.tool.myBind(this.commitData, page));
        this.dataGrid1.on('drawcell', this.tool.myBind(this.totalNum, page));
        this.dataGrid2.on('drawcell', this.tool.myBind(this.drawDatagrid2, page));
        this.dataGrid1.on("cellbeginedit", this.tool.myBind(this.beginEdit, page));
        this.dataGrid1.on("cellendedit", this.tool.myBind(this.endEdit, page));

        this.btnImportOk.on('click', this.tool.myBind(this.importFile, page));
    },
    needChange:function(){
        var num=page.txtNeedSum.getValue();
        page.txtLastIss.setValue(num);
    },
    endEdit:function(e){
        var record=e.record;
        var obj={finalDemandQty:record.demandQty};
        page.dataGrid1.updateRow(record,obj);
    },
    beginEdit:function(e){
        if (e.field=="activation") {
            e.cancel = true;
        }
    },
    totalNum: function (e) {
        var record=e.record;
        if (e.field=="finalDemandQty"){
            if (record.finalDemandQty==null||record.finalDemandQty==''){
                e.cellHtml=record.demandQty;

            }
        }

        var data = page.dataGrid1.getData();


        page.txtMaterialCost.setValue(data.reduce((accumulator, current) => accumulator + (current.materialCost === null ? 0 : current.materialCost), 0));


    },
    //绘制可以下载的
    drawDatagrid2: function (e) {
        var column = e.column;
        var record = e.record;
        if (column.name == "fileName") {
            e.cellHtml = '<a href="javascript:page.Appdownload(\'' + record.fileId + '\')">' + record.fileName + '</a>';
        }

    },
    Appdownload: function (fileId) {
        var url = page.url + "/fileDownload?fileId=" + fileId;
        page.download(url);
    },
    download: function (url) {
        var elemIF = document.createElement("iframe");
        elemIF.src = url;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
    },
    //新增申请材料
    appAdd: function () {
        var row = {
            componentsId: page.guid,
            createNode: '01',
            activation: 'Y'
        };
        page.dataGrid1.addRow(row);

    },
    //删除申请材料
    appDel: function () {
        var data = page.dataGrid1.getSelecteds();
        var json = mini.encode(data);
        if (json == "[]") {
            mini.alert("请选择一条数据", "提示");
            return;
        }


        var param = {
            data: json
        };

        mini.confirm("确认删除", "提示", function (action) {
            if (action == 'ok') {
                $.ajax({
                    type: "post",
                    data: param,
                    url: page.url + "/delAppInfo",
                    success: function (text) {
                        if (text.flag == 1) {
                            page.dataGrid1.reload();
                            mini.alert("删除成功");
                        } else {
                            mini.alert(mini.decode(text).error);
                        }
                    }
                })
            }

        })


    },
    //上传附件
    uploadfile: function () {
        document.getElementById("importForm").reset();
        var form = new mini.Form("#importForm");
        this.importFileWindow.show();
    },
    // 上传附件
    importFile: function () {
        var form = new mini.Form("#importForm");
        form.validate();
        if (form.isValid() == false) {
            return;
        }

        var param = {
            TypeCd: '01',
            billId: page.guid,
            billNo: page.billNo
        };
        $("#importForm").ajaxSubmit({
            type: "POST",
            dataType: "text",
            data: param,
            url: page.url + "/uploadAttchment",
            success: function (responsedata) {
                var json = mini.decode(responsedata);
                mini.alert(json.msg, "结果");
                page.dataGrid2.reload()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                mini.alert(jqXHR.responseText, "结果");
            }
        });
    },
    //删除文件
    delComFile: function () {
        var data = page.dataGrid2.getSelecteds();

        var json = mini.encode(data);
        if (json == "[]") {
            mini.alert("请选择一条数据", "提示");
            return;
        }

        var param = {
            data: json
        };

        mini.confirm("确认删除", "提示", function (action) {
            if (action == 'ok') {
                $.ajax({
                    type: "post",
                    data: param,
                    url: page.url + "/delComFile",
                    success: function (text) {
                        if (text.flag == 1) {
                            page.dataGrid2.reload();
                            mini.alert("删除成功");
                        } else {
                            mini.alert(mini.decode(text).error);
                        }
                    }
                })
            }

        })
    },
    //保存基本信息
    saveData: function () {
        var param = page.getParam();
        $.ajax({
            url: page.url + "/saveBase",
            data: {data: JSON.stringify(param)},
            type: "post",
            success: function (text) {
                if (text.flag == 1) {
                    mini.alert("保存基础信息成功");

                } else {
                    mini.alert(mini.decode(text).error);
                }
            },
            error: function () {
                mini.alert("保存基础信息失败");
            }
        })
        if (page.dataGrid1.isChanged()) {
            var saveData = page.dataGrid1.getChanges();
            if (!page.validAppInfo(saveData)){
                mini.alert("申请材料有必填项未填写");
                return;
            }

            $.ajax({
                url: page.url + "/saveAppInfo",
                data: {data: JSON.stringify(saveData)},
                type: "post",
                success: function (text) {
                    if (text.flag == 1) {
                        mini.alert("保存申请材料成功");
                        page.dataGrid1.reload();
                    } else {
                        mini.alert(text.error);
                    }
                },
                error: function () {
                    mini.alert("删除申请材料失败");
                }
            })
        }
    },
    validAppInfo: function (datas) {
        return datas.every(item =>
            ![item.materialName, item.unit, item.demandQty, item.materialSources].some(
                val => val == null || val == ''
            )
        );
    },
    //提交基本信息
    commitData: function () {
        if (page.dataGrid1.getData().length==0){
            mini.alert("申请材料至少有一条数据");
            return;
        }

        mini.confirm("提交会保存已编辑内容", "提示", function (action) {
            if (action == 'ok') {
                var param = page.getParam();
                var saveData={};
                if (page.dataGrid1.isChanged()) {
                    saveData = page.dataGrid1.getChanges();
                    if (!page.validAppInfo(saveData)){
                        mini.alert("申请材料有必填项未填写");
                        return;
                    }
                }
                $.ajax({
                    url: page.url + "/saveBaseCommit",
                    data: {data: JSON.stringify(param),data2:JSON.stringify(saveData)},
                    type: "post",
                    success: function (text) {
                        if (text.flag == 1) {
                            mini.confirm("提交成功", '提示', function (action) {
                                page.closeWindow('ok');
                            });
                        } else {
                            mini.alert(mini.decode(text).error);
                        }
                    },
                    error: function () {
                        mini.alert("保存基础信息失败");
                    }
                })

            }
        })
    },
    getParam: function () {
        if (!page.isNumber(page.txtNeedSum.getValue())){
            mini.alert("格式错误");
            throw new Error("格式错误");
            return ;
        }
        if (isNaN(page.txtTel.getValue()==null?0:page.txtTel.getValue())){
            mini.alert("格式错误");
            throw new Error("格式错误");

            return ;
        }


        var param = {
            guid: page.guid,
            billNo: page.billNo,
            projNo: page.cmbProjNo.getValue(),
            divCd: page.cmbDiv.getValue(),
            numberNo: page.txtNeedSum.getValue(),
            tel: page.txtTel.getValue(),
            needDate: page.dateNeed.getValue(),
            dwgno: page.txtDwg.getValue(),
            materialTotalCost: page.txtMaterialCost.getValue(),
            finalNumberNo: page.txtLastIss.getValue(),
            mhBdgt: page.txtLaborHour.getValue(),
            componentsName: page.txtProgram.getValue(),
            remark: page.txtRemark.getValue(),
        }
        return param;
    },
    ComponentssetData: function (data, flag, textData, flag2) {
        var cloneData = mini.clone(data);
        var cloneData2 = mini.clone(textData);
        page.txtAppNo.setValue(cloneData.billNo);
        page.txtCom.setValue(cloneData2.com);
        page.txtDept.setValue(cloneData.deptDesc);
        page.txtAppUser.setValue(cloneData.appUser);
        page.billNo = cloneData.billNo;
        page.guid = cloneData.guid;
        page.searchFile(cloneData.billNo);
        page.searchAudit(cloneData.billNo);
        page.searchBase(cloneData);
        page.searchApp(cloneData.billNo);

        if (flag) {
        } else {
            // page.dateApp.setValue(cloneData2.createDate);
        }

        if (flag2) {
            page.cmbProjNo.disable();
            page.cmbDiv.disable();
            page.txtNeedSum.disable();
            page.txtTel.disable();
            page.dateNeed.disable();
            page.txtProgram.disable();
            page.txtRemark.disable();
            this.btnAppAdd.hide();
            this.btnAppDel.hide();
            this.btnUpload.hide();
            this.btnFileDel.hide();
            this.btnSave.hide();
            this.btnCommit.hide();
            this.btnImportOk.hide();
            page.dataGrid1.allowCellEdit = false;
        }
    },
    isNumber:function(value){
        var parsed=parseFloat(value);
        return !isNaN(value)&&parsed.toString()===value.toString();
    },
    searchBase: function (cloneData) {
        page.cmbProjNo.setValue(cloneData.projNo);
        page.cmbDiv.setValue(cloneData.divCd);
        page.txtNeedSum.setValue(cloneData.numberNo);
        page.txtTel.setValue(cloneData.tel);
        page.dateNeed.setValue(cloneData.needDate);
        page.txtDwg.setValue(cloneData.dwgno);
        page.txtMaterialCost.setValue(cloneData.materialTotalCost);
        page.txtLastIss.setValue(cloneData.finalNumberNo);
        page.txtLaborHour.setValue(cloneData.mhBdgt);
        page.txtProgram.setValue(cloneData.componentsName);
        page.txtRemark.setValue(cloneData.remark);
        page.dateApp.setValue(cloneData.createDate);
    },
    searchApp: function (billNo) {

        this.tool.dataLoadDw(this.dataGrid1, this.url + "/getCompnentsApp", {billNo: billNo});

    },
    searchFile: function (billNo) {
        this.tool.dataLoadDw(this.dataGrid2, this.url + "/getCompnentsAppFile", {billNo: billNo});

    },
    searchAudit: function (billNo) {
        this.tool.dataLoadDw(this.dataGrid3, this.url + "/getCompnentsAppAudit", {billNo: billNo});

    },
    closeWindow: function (action) {
        if (window.CloseOwnerWindow) {
            return window.CloseOwnerWindow(action);
        } else if (window.parent) {
            window.parent.open('', '_parent', '');
            window.parent.close();
        } else if (window) {
            window.close();
        } else {
            top.close();
        }
    },
}