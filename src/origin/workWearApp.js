/**
 * Created by cs-bd01 on 2019/8/29.
 */
$(document).ready(pageInit);

function pageInit() {
    mini.parse();
    page.init();
    page.dataBind();
    page.event();
}

var page = {
    init: function () {
        this.tool = new PageTool();
        this.ip = this.tool.getSiteIp();
        this.url = this.ip + "/components";
        this.cbbCompany = mini.get("cbbCompany");
        this.cbbDepartment = mini.get("cbbDepartment");
        this.cmbProjNo = mini.get("cmbProjNo");
        this.cmbStatus = mini.get("cmbStatus");
        this.date1 = mini.get("date1");
        this.date2 = mini.get("date2");

        this.txtProNameNo = mini.get("txtProNameNo");
        this.btnSearch = mini.get("btnSearch");
        this.btnAdd = mini.get("btnAdd");
        this.btnDel = mini.get("btnDel");
        this.btnRetract = mini.get("btnRetract");
        this.btnPrint = mini.get("btnPrint");

        this.dataGrid1 = mini.get("dataGrid1");

        this.createWindow = mini.get("createWindow");
        this.txtProgram = mini.get("txtProgram");
        this.btnCreate = mini.get("btnCreate");
        this.btnCancelCreate = mini.get("btnCancelCreate");
    },
    dataBind: function () {
        var cdate = new Date();
        var mdate = new Date(cdate.getTime());
        mdate.setMonth(cdate.getMonth() - 1);
        this.date1.setValue(mdate);

    },
    event: function () {

        //公司变化
        this.cbbCompany.on('valueChanged', this.tool.myBind(this.companyChanged, page));
        //
        this.btnSearch.on('click', this.tool.myBind(this.searchData, page));

        this.btnAdd.on('click', this.tool.myBind(this.addData1, page));
        this.btnCreate.on('click', this.tool.myBind(this.addData, page));
        this.btnCancelCreate.on('click', this.tool.myBind(this.hideWindow, page));

        this.btnDel.on('click', this.tool.myBind(this.delData, page));

        this.btnRetract.on('click', this.tool.myBind(this.retractData, page));

        this.btnPrint.on('click', this.tool.myBind(this.printData, page));

        this.dataGrid1.on('drawcell', this.tool.myBind(this.drawData, page));

    },
    hideWindow: function () {
        page.createWindow.hide();
        page.txtProgram.setValue("");
    },
//
    drawData: function (e) {
        var column = e.column;
        var record = e.record;
        var str = "审核内容";
        if (column.name == "billNo") {
            e.cellHtml = '<a  href="javascript:page.showData(\'' + record.guid + '\')">' + record.billNo + '</a>';
        }
        ;
        if (column.name == "status") {
            if (record.maProcessId == null || record.maProcessId == '') {
            } else {
                e.cellHtml = '<a  href="javascript:page.showBpm(\'' + record.maProcessId + '\')">' + '流程追踪' + '</a>';
            }
        }
        ;
    },
    showBpm: function (pid) {

        $.ajax({
            url: page.url + "/getBpmPath",
            data: {pid: pid},
            type: "post",
            async: false,
            success: function (url) {

                if (url) {
                    window.open(url, '_blank', 'width=1500,height=800,resizable=yes,scrollbars=yes');
                } else {
                    mini.alert("获取流程url失败")
                }
            },
            error: function () {
                mini.alert("打开失败");
            }
        })
    },
    showData: function (billId) {
        var flag = true;
        if (page.dataGrid1.getSelected().maStatus == '01' || page.dataGrid1.getSelected().maStatus == '00') {
            if (page.dataGrid1.getSelected().appUser == page.dataGrid1.getSelected().empNo) {
                flag = false;
            }
        }
        $.ajax({
            url: page.url + "/getBillInfo",
            data: {billId: billId},
            type: "post",
            async: false,
            success: function (data) {
                if (data.guid) {
                    cloneData = mini.clone(data);
                    var param = {
                        billNo: cloneData.billNo,
                        com: cloneData.companyEnDesc,
                        dept: cloneData.deptDesc,
                        appUser: cloneData.appUser,
                        dateApp: page.myGetDate(cloneData.appDate, 'yyyyMMdd'),
                        guid: cloneData.guid
                    }
                }
                mini.open({
                    url: page.ip + "/doc/window/Components_Create_windows.html"
                    , title: "工装申请"
                    , iconCls: "icon-add"
                    , showMaxButton: true
                    , width: "1100px"
                    , height: "700px"
                    , allowResize: true
                    , allowDrag: true
                    , onload: function () {       //加载完成后调用
                        var iframe = this.getIFrameEl();
                        //调用弹出页面方法进行初始化
                        iframe.contentWindow.page.ComponentssetData(cloneData, false, param, flag);
                    }
                    , ondestroy: function () {  //页面关闭调用
                        page.searchData();
                    }
                })
            },
            error: function () {
                mini.alert("打开失败");
            }
        })

    },
    companyChanged: function () {
        this.cbbDepartment.setValue("");
        this.tool.dataLoadDdlb(this.cbbDepartment, page.url + "/getDeptCombobox", {superOrgnCd: this.cbbCompany.getValue()});
    },
    searchData: function () {
        if (page.valitData()) {
            mini.alert(page.valitData());
            return;
        }

        var dateFrom = page.myGetDate(page.date1.getValue(), 'yyyyMMdd');
        var dateTo = page.myGetDate(page.date2.getValue(), 'yyyyMMdd');
        var param = {
            companyNo: page.cbbCompany.getValue(),
            dateFrom: dateFrom,
            dateTo: dateTo,
            deptNo: page.cbbDepartment.getValue(),
            projNo: page.cmbProjNo.getValue(),
            maStatus: page.cmbStatus.getValue(),
            componentsName: page.txtProNameNo.getValue()
        }
        this.tool.dataLoadDw(page.dataGrid1, page.url + "/getTComponentsData", param);

    },
    addData1: function () {
        page.txtProgram.setValue("");
        page.createWindow.show();
    },
    addData: function () {
        // if (page.valitData()){
        //     mini.alert(page.valitData());
        //     return;
        // }
        if (!page.txtProgram.getValue()) {
            mini.alert("必须填写项目名称");
            return;
        }
        // if (!page.cbbDepartment.getValue()){
        //     mini.alert("必须选择部门");
        //     return;
        // }
        // var compNo=page.cbbCompany.getSelected().descEng;


        var cloneData;
        $.ajax({
            url: page.url + "/createBase",
            data: {programName: page.txtProgram.getValue()},
            type: "post",
            async: false,
            success: function (data) {
                if (data.guid) {
                    cloneData = mini.clone(data);
                    var param = {
                        billNo: cloneData.billNo,
                        com: cloneData.companyEnDesc,
                        dept: cloneData.deptDesc,
                        appUser: cloneData.appUser,
                        dateApp: page.myGetDate(cloneData.appDate, 'yyyyMMdd'),
                        guid: cloneData.guid
                    }
                }
                mini.open({
                    url: page.ip + "/doc/window/Components_Create_windows.html"
                    , title: "工装申请"
                    , iconCls: "icon-add"
                    , width: "1100px"
                    , height: "700px"
                    , allowResize: true
                    , showMaxButton: true
                    , allowDrag: true
                    , onload: function () {       //加载完成后调用
                        var iframe = this.getIFrameEl();
                        //调用弹出页面方法进行初始化
                        iframe.contentWindow.page.ComponentssetData(cloneData, false, param, false);
                    }
                    , ondestroy: function () {  //页面关闭调用
                        page.searchData();
                    }
                })
            },
            error: function () {
                mini.alert("打开失败");
            }
        })
        page.createWindow.hide();


    },
    delData: function () {
        if (page.dataGrid1.getSelected().appUser != page.dataGrid1.getSelected().empNo) {
            mini.alert("不可删除他人项目");
            return;
        }
        var data = page.dataGrid1.getSelecteds();
        if (data.length == 0) {
            mini.alert("请选择一条数据进行删除");
            return;
        }
        if (!data.every(item => item.maStatus == '01')) {
            mini.alert("必须是“编制”才可以删除");
            return;
        }
        for (var i = 0; i < data.length; i++) {
            // if (page.dataGrid1.getSelecteds()[i]._state='added'){
            //     page.dataGrid1.removeRow(page.dataGrid1.getSelecteds()[i]);
            //     continue;
            // }
            var guid = page.dataGrid1.getSelecteds()[i].guid;
            $.ajax({
                url: page.url + "/delApp",
                data: {guid: guid},
                type: "post",
                success: function (text) {
                    if (text.flag == 1) {
                        mini.alert("删除成功");
                        page.dataGrid1.reload();
                    } else {
                        mini.alert(mini.decode(text).error);
                    }
                },
                error: function () {
                    mini.alert("删除失败");
                }
            })

        }

    },
    retractData: function () {
        if (page.dataGrid1.getSelected().appUser != page.dataGrid1.getSelected().empNo) {
            mini.alert("不可撤回他人项目");
            return;
        }
        var data = page.dataGrid1.getSelecteds()
        if (data.length == 0) {
            mini.alert("请选择一条数据进行退回");
            return;
        }
        if (data.every(item => item.maStatus == '01' || item.maStatus == '00' || item.maStatus == '03')) {
            mini.alert("必须是在流程中才可以才可以退回");
            return;
        }
        for (var i = 0; i < data.length; i++) {

            var guid = data[i].guid;

            $.ajax({
                url: page.url + "/retractApp",
                data: {guid: guid},
                type: "post",
                success: function (text) {
                    if (text.flag == 1) {
                        mini.alert("退回成功");
                        page.dataGrid1.reload();
                    } else {
                        mini.alert(mini.decode(text).error);
                    }
                },
                error: function () {
                    mini.alert("退回失败");
                }
            })


        }


    },
    printData: function () {
        var data = page.dataGrid1.getSelected();
        if (data.maStatus != "03") {
            mini.alert("只有通过审批才能生成pdf", "提示");
            return;
        }
        console.log(data);
        var param = {
            billNo: page.dataGrid1.getSelected().billNo
        };
        var stringdata = JSON.stringify(param);
        var param1 = {
            stringdata: stringdata
        }
        page.download(page.url + "/printPdf?" + $.param(param1));
    },
    // 文件下载
    download: function (url) {
        var elemIF = document.createElement("iframe");
        elemIF.src = url;
        elemIF.style.display = "none";
        document.body.appendChild(elemIF);
    },
    myGetDate: function (inDate, dateFormat) {
        var tmpDate = inDate;

        if (!inDate) {
            return "";
        }

        if (typeof (inDate) == 'string') {
            tmpDate = mini.parseDate(inDate);
        }

        if (!dateFormat) {
            dateFormat = "yyyy-MM-dd";
        }

        return mini.formatDate(tmpDate, dateFormat);
    },
    valitData: function () {
        if (!page.cbbCompany.getValue()) {
            return "查询请选择公司主体";
        }

        // if (!page.cbbDepartment.getValue()){
        //     return "必须选择部门";
        // }
        return false;
    },
}