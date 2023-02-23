/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './App.css';
import { Table, Input, Tag, Radio } from 'antd';
import type { ColumnsType} from 'antd/es/table';
import axios from 'axios';
import qs from 'qs';
import config from './config/config';
interface DataType {
  key: React.Key,
  title: string,
  author_name: string[],
  first_publish_year: number,
  isbn: string[],
  number_of_pages_median: number
};

interface PageInfoType {
  current: number,
  pageSize: number,
  sort: string
};

interface BookType {
  author_alternative_name: string[],
  author_facet: string[],
  author_key: string[],
  author_name: string[],
  ddc: string[],
  ddc_sort: string[],
  ebook_access: string,
  ebook_count_i: number,
  edition_count: number,
  edition_key: string[],
  first_publish_year: number,
  has_fulltext: boolean,
  id_goodreads: string[],
  id_librarything: string[],
  isbn: string[],
  key: string,
  language: string[],
  last_modified_i: number,
  lcc: string[],
  lcc_sort: string[],
  lccn: string[],
  number_of_pages_median: number,
  oclc: string[],
  public_scan_b: boolean,
  publish_date: string[],
  publish_place: string[],
  publish_year: number[],
  publisher: string[],
  publisher_facet: string[],
  seed: string[],
  subject: string[],
  subject_facet: string[],
  subject_key: string[],
  title: string,
  title_suggest: string,
  type: string,
  _version_: number
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState<string>('book name');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState<PageInfoType>({
    current: 1,
    pageSize: 10,
    sort: ''
  });
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'No',
      render: (_value, _record, index) => {
        return (pageInfo.current - 1) * pageInfo.pageSize + index + 1
      },
      width: 10
    },
    {
      title: 'Book title',
      dataIndex: 'title',
      width: 80
    },
    {
      title: 'Author(s) name',
      dataIndex: 'author_name',
      render: (value: string[]) => (
        value && value.map((item) => <Tag>{item}</Tag>)
      ),
      width: 20
    },
    {
      title: 'Year book was first published',
      dataIndex: 'first_publish_year',
      width: 40
    },
    {
      title: 'ISBN number',
      dataIndex: 'isbn',
      render: (value: string[]) => (
        value && value.map((item) => <Tag>{item}</Tag>)
      ),
      width: 500
    },
    {
      title: 'pages',
      dataIndex: 'number_of_pages_median',
      width: 50
    },
  ];

  useEffect(() => {
    fetchData();
  }, [pageInfo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchData = () => {
    if (searchText.length === 0) return;
    setLoading(true);
    const param = {
      q: searchText,
      offset: pageInfo.current-1,
      limit: pageInfo.pageSize,
      sort: pageInfo.sort
    };
    const url = config.url + '?' + qs.stringify(param);
    axios.get(url)
      .then((response) => {
        const res = response.data;
        setTotalCount(res.numFound);
        const array: DataType[] = [];
        res.docs && res.docs.forEach((item: BookType) => {
          array.push({
            key: item.key,
            title: item.title,
            author_name: item.author_name,
            first_publish_year: item.first_publish_year,
            isbn: item.isbn,
            number_of_pages_median: item.number_of_pages_median
          });
        });
        setDataSource(array);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleChange = (e: string) => {
    setSearchText(e);
  };

  const handleSortChange = () => {
    setPageInfo({
      current: pageInfo.current,
      pageSize: pageInfo.pageSize,
      sort: 'first_publish_year'
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    const current = pageInfo.pageSize === pageSize ? page : 1;
    setPageInfo({
      current: current,
      pageSize: pageSize,
      sort: pageInfo.sort
    });
  }

  return (
    <>
      <div className="App">
        <div className='input-stype'>
          <Input value={searchText} onChange={(e) => handleChange(e.target.value)} />
          <Radio onChange={(e) => e.target.checked ? handleSortChange() : null}>Sort by year</Radio>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          size='small'
          rowKey={(record) => record.key}
          pagination={{
            pageSize: pageInfo.pageSize,
            pageSizeOptions: [10, 20, 50, 100],
            total: totalCount,
            current: pageInfo.current,
            onChange: (page, pageSize) => handlePageChange(page, pageSize)
          }}
        />
      </div>
    </>
  );
}

export default App;
