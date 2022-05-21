window.onresize = function () {
    if(parseInt(sliderslider.__index) === 0 && service.status) {
        try{
            let service_usage = echarts.getInstanceByDom(document.getElementById('cpu-status'));
            service_usage.resize();
        }catch (e) {}
    }else if (parseInt(sliderslider.__index) === 1) {
        console.log(sliderslider.__index);
        if (service.monitor_target) {
            try{
                let barchart = echarts.getInstanceByDom(document.getElementById(document.client_main_usage.ele));
                barchart.resize();
                for (let i in document.client_disk_usage.disk) {
                    let barchart = echarts.getInstanceByDom(document.getElementById('client_disk_' + document.client_disk_usage.disk[i]));
                    barchart.resize();
                }
            }catch (e) {}
        }
    }
};


sliderslider.on_switch = function (tis, index) {
    if (index === 1 && service.monitor_target) {
        try{
            let barchart = echarts.getInstanceByDom(document.getElementById('client_main_usage_charts'));
            barchart.resize();
            for (let i in document.client_disk_usage.disk) {
                let barchart = echarts.getInstanceByDom(document.getElementById('client_disk_' + document.client_disk_usage.disk[i]));
                barchart.resize();
            }
        }catch (e) {

        }
    }

    if(index === 0 && service.status) {
        try{
            let service_eachrts = echarts.getInstanceByDom(document.getElementById('cpu-status'));
            service_eachrts.resize();
        }catch (e) {

        }
    }
};
