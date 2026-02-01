# 🏆 Microsoft Rewards Bot - Auto Farmer Extension

> **Automatize a coleta de pontos do Microsoft Rewards com esta extensão para Chrome/Edge!**

**🇧🇷 Português** | [🇺🇸 English](#english) | [🇨🇳 中文](#中文)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-brightgreen)
![Stars](https://img.shields.io/github/stars/Italoguerrapii/ms-points-farmer?style=social)

---

## 🇧🇷 PORTUGUÊS

## 🔥 O que é?

Uma **extensão de navegador** que automatiza a coleta de pontos do **Microsoft Rewards** fazendo:

- ✅ **Buscas Desktop** automaticamente
- ✅ **Buscas Mobile** (com User-Agent spoofing)
- ✅ **Cards diários** (daily sets, quizzes, polls)
- ✅ **Delays humanizados** para evitar detecção
- ✅ **~150-200 pontos por dia** sem esforço!

---

## 🎯 Keywords / Palavras-chave

`microsoft rewards bot` `microsoft rewards farmer` `bing rewards bot` `auto search bing` `microsoft points bot` `rewards automation` `bing search bot` `microsoft rewards hack` `free xbox game pass` `farm microsoft points` `bing rewards farmer` `auto bing search` `microsoft rewards script` `edge rewards bot`

---

## 📸 Preview

```
┌─────────────────────────────────────┐
│  🏆 Rewards Tracker                 │
├─────────────────────────────────────┤
│  🖥️ Desktop    📱 Mobile    🎯 Daily │
│    45/45         35/35        3/3   │
├─────────────────────────────────────┤
│  [▶️ Start All Tasks]               │
│                                     │
│  [🖥️ Desktop] [📱 Mobile] [🎯 Daily]│
├─────────────────────────────────────┤
│  📋 Activity Log                    │
│  ✅ Desktop searches completed      │
│  ✅ Mobile searches completed       │
│  ✅ Daily sets completed            │
│  🎉 +290 points earned!             │
└─────────────────────────────────────┘
```

---

## 🚀 Instalação (2 minutos)

### Passo 1: Baixar

```bash
git clone https://github.com/Italoguerrapii/ms-points-farmer.git
```

**Ou** clique em **[Code] → [Download ZIP]** e extraia.

### Passo 2: Instalar no Navegador

#### Microsoft Edge:
1. Abra `edge://extensions`
2. Ative o **"Modo do desenvolvedor"** (canto inferior esquerdo)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `ms-points-farmer`

#### Google Chrome:
1. Abra `chrome://extensions`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta `ms-points-farmer`

### Passo 3: Usar

1. **Faça login** em https://rewards.bing.com
2. Clique no **ícone da extensão** 🏆
3. Clique em **"Start All Tasks"** ou escolha individualmente:
   - 🖥️ **Desktop** - 45 buscas desktop
   - 📱 **Mobile** - 35 buscas mobile
   - 🎯 **Daily** - Cards e atividades diárias

---

## 📖 Como Funciona

### 🖥️ Buscas Desktop (45 buscas → 90 pontos garantidos)
- Microsoft Rewards dá **3 pontos** por busca (máximo 30 buscas/dia = 90 pontos)
- A extensão faz **45 buscas** (15 extras) para garantir que você atinja o máximo
- **Por quê?** Algumas buscas podem não pontuar (cache, duplicadas, etc.)
- Delay de **8-15 segundos** entre buscas (comportamento humanizado)
- Pausa a cada **5 buscas** para simular comportamento real

### 📱 Buscas Mobile (35 buscas → 60 pontos garantidos)
- Microsoft Rewards dá **3 pontos** por busca mobile (máximo 20 buscas/dia = 60 pontos)
- A extensão faz **35 buscas** (15 extras) para garantir que você atinja o máximo
- **Por quê?** Margem de segurança caso algumas não pontuem
- Usa **User-Agent spoofing** para simular iPhone iOS 17
- Inclui headers realistas (`Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`)
- Mesmos delays humanizados

### 🎯 Cards Diários (~10-50 pontos por card)
- Detecta automaticamente cards disponíveis na página
- Pula cards já completados (verifica ícone de check ✅)
- Ignora cards de indicação/promoção (referral, Spotify, etc.)
- Abre e fecha cada card automaticamente
- Funciona com: quizzes, polls, atividades diárias

### 🧠 Geração de Termos de Busca
- Sistema elaborado com **2.9 bilhões de combinações** únicas
- Palavras aleatórias de diversas categorias
- Adiciona números aleatórios ocasionalmente
- Nunca repete termos no mesmo dia

---

## ⚙️ Configurações

| Opção | Descrição |
|-------|-----------|
| Desktop searches | Ativar/desativar buscas desktop |
| Mobile searches | Ativar/desativar buscas mobile |
| Daily activities | Ativar/desativar cards diários |
| Daily reminder | Notificação às 10:00 AM |

---

## 🛡️ Anti-Detecção

A extensão usa várias técnicas para evitar banimento:

- ✅ **Delays aleatórios** (8-15s entre buscas)
- ✅ **Pausas periódicas** (a cada 5 buscas)
- ✅ **Termos de busca variados** (2.9B combinações)
- ✅ **Scroll aleatório** na página
- ✅ **User-Agent realista** (iPhone iOS 17)
- ✅ **Headers completos** de navegador mobile

---

## 🔧 Tecnologias

- **Manifest V3** (padrão mais recente)
- **Service Worker** (roda em background)
- **Content Scripts** (interage com páginas)
- **Chrome APIs** (storage, tabs, scripting)

---

## 📊 Pontos por Dia (Nível 2)

| Atividade | Buscas | Máximo de Pontos |
|-----------|--------|------------------|
| Desktop | 45 (30 contam) | ~90 |
| Mobile | 35 (20 contam) | ~60 |
| Cards diários | 2-5 cards | ~20-50 |
| **TOTAL DIÁRIO** | **80 buscas** | **~150-200** |

**Por mês:** ~4.500-6.000 pontos 🎉

> ⚠️ **Por que fazer buscas extras?**
> - A extensão faz 45 desktop e 35 mobile para **garantir** que você atinja o máximo
> - Algumas buscas podem não pontuar (cache, duplicadas, muito rápidas)
> - As extras são uma **margem de segurança** para garantir seus pontos
> - Microsoft conta apenas as primeiras 30 desktop e 20 mobile que pontuarem

> ℹ️ Os pontos variam conforme seu nível e região. Valores baseados no Brasil, Nível 2.

---

## ❓ FAQ

### É seguro usar?
Use por sua conta e risco. A extensão usa delays humanizados para minimizar riscos.

### Funciona no Brasil?
Sim! Microsoft Rewards está disponível no Brasil.

### Precisa deixar o navegador aberto?
Sim, enquanto a automação está rodando.

### Posso usar em várias contas?
Sim, mas use perfis diferentes do navegador.

### Por que os cards mostram 0?
Provavelmente já estão todos completados. Tente no dia seguinte.

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## ⭐ Gostou? Deixe uma Star!

Se este projeto te ajudou, **deixe uma ⭐ star** no repositório!

Isso ajuda mais pessoas a encontrarem o projeto.

[![Star History Chart](https://api.star-history.com/svg?repos=Italoguerrapii/ms-points-farmer&type=Date)](https://star-history.com/#Italoguerrapii/ms-points-farmer&Date)

---

## 📞 Contato

**Italo Guerra**
- GitHub: [@Italoguerrapii](https://github.com/Italoguerrapii)
- Issues: [Reportar Bug](https://github.com/Italoguerrapii/ms-points-farmer/issues)

---

## ⚠️ Disclaimer / Aviso Legal

```
Este projeto é apenas para FINS EDUCACIONAIS.

- NÃO é afiliado, endossado ou conectado à Microsoft Corporation
- O uso pode violar os Termos de Serviço da Microsoft
- O desenvolvedor NÃO se responsabiliza por suspensões ou banimentos
- Use INTEIRAMENTE por sua conta e risco

Ao usar esta extensão, você concorda com estes termos.
```

---

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar.

---

<p align="center">
  <b>Feito com ❤️ por <a href="https://github.com/Italoguerrapii">Italo Guerra</a></b>
  <br>
  <br>
  <a href="https://github.com/Italoguerrapii/ms-points-farmer">⭐ Star este repo se foi útil!</a>
</p>

---

## <a id="english"></a>🇺🇸 ENGLISH

## 🔥 What is it?

A **browser extension** that automates **Microsoft Rewards** points collection by:

- ✅ **Desktop searches** automatically
- ✅ **Mobile searches** (with User-Agent spoofing)
- ✅ **Daily cards** (daily sets, quizzes, polls)
- ✅ **Humanized delays** to avoid detection
- ✅ **~150-200 points per day** effortlessly!

## 🚀 Installation (2 minutes)

### Step 1: Download

```bash
git clone https://github.com/Italoguerrapii/ms-points-farmer.git
```

**Or** click **[Code] → [Download ZIP]** and extract.

### Step 2: Install in Browser

#### Microsoft Edge:
1. Open `edge://extensions`
2. Enable **"Developer mode"** (bottom left)
3. Click **"Load unpacked"**
4. Select the `ms-points-farmer` folder

#### Google Chrome:
1. Open `chrome://extensions`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `ms-points-farmer` folder

### Step 3: Use

1. **Log in** to https://rewards.bing.com
2. Click the **extension icon** 🏆
3. Click **"Start All Tasks"** or choose individually:
   - 🖥️ **Desktop** - Desktop searches
   - 📱 **Mobile** - Mobile searches
   - 🎯 **Daily** - Daily cards

## 📊 Points per Day (Level 2)

| Activity | Searches | Max Points |
|----------|----------|------------|
| Desktop | 45 (30 count) | ~90 |
| Mobile | 35 (20 count) | ~60 |
| Daily cards | 2-5 cards | ~20-50 |
| **DAILY TOTAL** | **80 searches** | **~150-200** |

**Per month:** ~4,500-6,000 points 🎉

> ⚠️ **Why extra searches?**
> - Extension performs 45 desktop + 35 mobile to **guarantee** you reach the maximum
> - Some searches may not count (cache, duplicates, too fast)
> - Extras are a **safety margin** to ensure your points
> - Microsoft only counts the first 30 desktop and 20 mobile that score

## ⚠️ Disclaimer

```
This project is for EDUCATIONAL PURPOSES ONLY.

- NOT affiliated with Microsoft Corporation
- Usage may violate Microsoft's Terms of Service
- Developer assumes NO responsibility for suspensions or bans
- Use ENTIRELY at your own risk
```

---

## <a id="中文"></a>🇨🇳 中文

## 🔥 这是什么？

一个**浏览器扩展**，通过以下方式自动收集**Microsoft Rewards**积分：

- ✅ **桌面搜索** 自动执行
- ✅ **移动搜索** （User-Agent伪装）
- ✅ **每日卡片** （每日任务、测验、投票）
- ✅ **人性化延迟** 避免检测
- ✅ **每天约150-200积分** 轻松获得！

## 🚀 安装（2分钟）

### 步骤1：下载

```bash
git clone https://github.com/Italoguerrapii/ms-points-farmer.git
```

**或者** 点击 **[Code] → [Download ZIP]** 并解压。

### 步骤2：在浏览器中安装

#### Microsoft Edge：
1. 打开 `edge://extensions`
2. 启用 **"开发者模式"** （左下角）
3. 点击 **"加载解压缩的扩展"**
4. 选择 `ms-points-farmer` 文件夹

#### Google Chrome：
1. 打开 `chrome://extensions`
2. 启用 **"开发者模式"** （右上角）
3. 点击 **"加载已解压的扩展程序"**
4. 选择 `ms-points-farmer` 文件夹

### 步骤3：使用

1. **登录** https://rewards.bing.com
2. 点击 **扩展图标** 🏆
3. 点击 **"开始所有任务"** 或单独选择：
   - 🖥️ **桌面** - 桌面搜索
   - 📱 **移动** - 移动搜索
   - 🎯 **每日** - 每日卡片

## 📊 每日积分（等级2）

| 活动 | 搜索次数 | 最大积分 |
|------|----------|----------|
| 桌面 | 45次（30次计分） | ~90 |
| 移动 | 35次（20次计分） | ~60 |
| 每日卡片 | 2-5个卡片 | ~20-50 |
| **每日总计** | **80次搜索** | **~150-200** |

**每月：** ~4,500-6,000积分 🎉

> ⚠️ **为什么要额外搜索？**
> - 扩展执行45次桌面+35次移动搜索以**确保**达到最大值
> - 某些搜索可能不计分（缓存、重复、速度太快）
> - 额外搜索是**安全余量**以确保获得积分
> - Microsoft只计算前30次桌面和20次移动的有效搜索

## ⚠️ 免责声明

```
本项目仅供教育目的。

- 与Microsoft Corporation无关
- 使用可能违反Microsoft服务条款
- 开发者不承担任何责任
- 使用风险自负
```

---

<p align="center">
  <b>Made with ❤️ by <a href="https://github.com/Italoguerrapii">Italo Guerra</a></b>
  <br>
  <br>
  <a href="https://github.com/Italoguerrapii/ms-points-farmer">⭐ Star if useful!</a>
</p>
