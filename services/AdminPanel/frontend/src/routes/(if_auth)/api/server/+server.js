import fs from 'fs/promises';
import { json } from '@sveltejs/kit';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

async function getHostMemory() {
    try {
        const meminfoContent = await fs.readFile('/proc/meminfo', 'utf-8');
        const lines = meminfoContent.split('\n');
        
        const totalMemoryLine = lines.find(line => line.startsWith('MemTotal:'));
        const freeMemoryLine = lines.find(line => line.startsWith('MemFree:'));

        if (!totalMemoryLine || !freeMemoryLine) {
            throw new Error('Could not find MemTotal or MemFree in /proc/meminfo');
        }

        const totalMemoryKB = parseInt(totalMemoryLine.split(/\s+/)[1], 10);
        const freeMemoryKB = parseInt(freeMemoryLine.split(/\s+/)[1], 10);
        
        const totalMemoryGB = (totalMemoryKB / 1024 / 1024).toFixed(2);
        const usedMemoryGB = ((totalMemoryKB - freeMemoryKB) / 1024 / 1024).toFixed(2);
        const usedMemoryPercent = (((totalMemoryKB - freeMemoryKB) / totalMemoryKB) * 100).toFixed(2);

        return { totalMemoryGB, usedMemoryGB, usedMemoryPercent };
    } catch (e) {
        console.error('Не удалось прочитать /proc/meminfo:', e);
        return { totalMemoryGB: 'N/A', usedMemoryGB: 'N/A', usedMemoryPercent: 'N/A' };
    }
}

async function getHostCpuLoad() {
    try {
        const statContent = await fs.readFile('/proc/stat', 'utf-8');
        const cpuLine = statContent.split('\n')[0];
        const cpuValues = cpuLine.match(/\d+/g).map(Number);
        
        const idle = cpuValues[3];
        const total = cpuValues.reduce((sum, value) => sum + value, 0);

        return { idle, total };
    } catch (e) {
        console.error('Не удалось прочитать /proc/stat:', e);
        return { idle: 0, total: 0 };
    }
}

async function getDiskInfo() {
    try {
        const { stdout } = await exec('df -B1');
        
        const lines = stdout.trim().split('\n');
        const rootFsLine = lines.find(line => line.startsWith('overlay') || line.endsWith(' /'));

        if (!rootFsLine) {
            throw new Error('Could not find root filesystem in df output');
        }

        const parts = rootFsLine.split(/\s+/);
        const totalBytes = parseInt(parts[1], 10);
        const usedBytes = parseInt(parts[2], 10);
        
        const totalDiskGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
        const usedDiskGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const usedDiskPercent = ((usedBytes / totalBytes) * 100).toFixed(2);

        return { totalDiskGB, usedDiskGB, usedDiskPercent };
    } catch (e) {
        console.error('Не удалось выполнить команду df:', e);
        return { totalDiskGB: 'N/A', usedDiskGB: 'N/A', usedDiskPercent: 'N/A' };
    }
}

export async function GET() {
    try {
        const startMeasure = await getHostCpuLoad();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const endMeasure = await getHostCpuLoad();
        
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        
        let cpuLoad = '0.00';
        if (totalDifference > 0) {
            cpuLoad = (100 - (100 * idleDifference / totalDifference)).toFixed(2);
        }
        
        const memoryData = await getHostMemory();
        const diskData = await getDiskInfo();

        return json({
            cpuLoad,
            ram: {
                totalMemory: memoryData.totalMemoryGB,
                usedMemory: memoryData.usedMemoryGB,
                usedMemoryPercent: memoryData.usedMemoryPercent
            },
            disk: {
                totalDisk: diskData.totalDiskGB,
                usedDisk: diskData.usedDiskGB,
                usedDiskPercent: diskData.usedDiskPercent
            }
        });
    } catch (e) {
        console.error('Ошибка при получении данных о сервере:', e);
        return json({ error: 'Не удалось получить данные о хосте.' }, { status: 500 });
    }
}