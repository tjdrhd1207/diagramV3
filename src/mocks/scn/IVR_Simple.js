export const ivr_simple_xml =
	`<?xml version="1.0" encoding="utf-8"?>
<scenario designer-version="2.0.1.5">
	<options />
	<scenario-pages>
		<page name="ivrmain.xml" start="true" tag="시작 페이지" lastOpened="true"/>
		<page name="host.xml" tag="" lastOpened="true"/>
	</scenario-pages>
	<variables key="app">
		<variable>
			<type>int64</type>
			<name>a</name>
			<init-value>1</init-value>
			<description>인트</description>
		</variable>
		<variable>
			<type>string</type>
			<name>b</name>
			<init-value>b</init-value>
			<description>스트링</description>
		</variable>
		<variable>
			<type>boolean</type>
			<name>c</name>
			<init-value>false</init-value>
			<description>불리언</description>
		</variable>
		<variable>
			<type>double</type>
			<name>d</name>
			<init-value>0.01</init-value>
			<description>더어블</description>
		</variable>
		<variable>
			<type>string</type>
			<name>header_a</name>
			<init-value />
			<description />
		</variable>
		<variable>
			<type>string</type>
			<name>header_b</name>
			<init-value />
			<description />
		</variable>
		<variable>
			<type>string</type>
			<name>body_a</name>
			<init-value />
			<description />
		</variable>
		<variable>
			<type>string</type>
			<name>body_b</name>
			<init-value />
			<description />
		</variable>
	</variables>
	<functions><![CDATA[function add(a, b) {
	return a + b;
}]]></functions>
	<interface>
		<use-trim>false</use-trim>
		<message>
			<code>TR0000</code>
			<name>티알공공공공</name>
			<variables-fixed>
				<variable>
					<mode>both</mode>
					<type>V</type>
					<value>app.header_a</value>
					<sort>D</sort>
					<replace />
					<position>0</position>
					<length>10</length>
					<description>헤더 a</description>
				</variable>
				<variable>
					<mode>both</mode>
					<type>V</type>
					<value>app.header_b</value>
					<sort>D</sort>
					<replace />
					<position>10</position>
					<length>5</length>
					<description />
				</variable>
				<variable>
					<mode>both</mode>
					<type>V</type>
					<value>app.body_a</value>
					<sort>D</sort>
					<replace />
					<position>15</position>
					<length>30</length>
					<description>바디 a</description>
				</variable>
				<variable>
					<mode>both</mode>
					<type>V</type>
					<value>app.body_b</value>
					<sort>D</sort>
					<replace />
					<position>45</position>
					<length>10</length>
					<description />
				</variable>
			</variables-fixed>
			<variables-iterative />
		</message>
	</interface>
</scenario>`;

export const ivrmain_xml =
	`
`;